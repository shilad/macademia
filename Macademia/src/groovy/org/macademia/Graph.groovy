package org.macademia

import java.util.Map.Entry
import org.macademia.IdAndScore
import org.apache.commons.logging.LogFactory
import org.apache.commons.logging.Log

/**
 * The graph class contains two hashMaps, so that edges can be accessed by looking up either vertex.
 * The vertices are available in two parts: the set of Person vertices and the set of Interest vertices.
 * Edges of all types can be added using the addEdge method
 *
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class Graph {


    static Log LOG = LogFactory.getLog(Graph.class)

    Long rootPersonId

    Map<Long, Set<Edge>> interestMap = [:]
    Map<Long, Set<Edge>> personMap  = [:]
    Map<Long, Set<Edge>> requestMap  = [:]

    Map<Long, IdAndScore> personScores  = [:]
    Map<Long, Set<Edge>> potentialPersonEdges  = [:]

    /**
     * Similarity between person's interests.
     * interestId1 => { interestId2 => similarity .... }
     */
    Map<Long, Map<Long, Double>> intraInterestSims = [:]

    /**
     * Mapping between interest id and cluster id (an int)
     * Interests in the same cluster are very similar.
     */
    Map<Long, Integer> interestClusters = [:]

    /**
     * Minimum similarity between items in the same cluster.
     * TODO: make this a configuration parameter.
     */
    private static final double MIN_CLUSTER_SIM = 0.02

    /**
     * Penalty for neighbor similarity scores that fall in the same cluster.
     * The penalty increases geometrically with the number of interests in
     * the same cluster.
     */
    private static final double CLUSTER_PENALTY = 0.6


    static TimingAnalysis timer = new TimingAnalysis("graph")

    int edges //needed for some unit tests

    /**
     *
     * @return an empty graph rooted at a particular person
     */
    public Graph(Long rootPersonId) {
        this.rootPersonId = rootPersonId
        edges = 0
    }

    /**
     * @return An empty graph rooted at a request or interest
     */
    public Graph() {
        this(null)
    }

    /**
     * used to add edges to the graph
     * adding an edge also adds the nodes the edge connects
     * @param e an edge
     *
     */
    private void addEdge(Edge e) throws IllegalArgumentException {
        if (interestMap.containsKey(e.interestId)) {
            if (!interestMap.get(e.interestId).contains(e)) {
              edges++
            }
            interestMap.get(e.interestId).add(e)
        } else {
            edges++
            HashSet<Edge> set = new HashSet()
            set.add(e)
            interestMap.put(e.interestId, set)
        }

        //edges may either be interest-person edges, interest-collaborator
        // request edges, or interest-interest edges.
        //as of now no other types of edges should exist
        if (e.personId != null) {
            if (potentialPersonEdges.containsKey(e.personId)) {
                potentialPersonEdges.get(e.personId).add(e)
            } else {
                HashSet<Edge> set = new HashSet()
                set.add(e)
                potentialPersonEdges.put(e.personId, set)
            }
        } else if (e.requestId != null){
                    if (requestMap.containsKey(e.requestId)) {
                        requestMap.get(e.requestId).add(e)
                    } else {
                        HashSet<Edge> set = new HashSet()
                        set.add(e)
                        requestMap.put(e.requestId, set)
                    }
        } else if (e.relatedInterestId != null) {
            if (interestMap.containsKey(e.relatedInterestId)) {
                interestMap.get(e.relatedInterestId).add(e)
            } else {
                HashSet<Edge> set = new HashSet()
                set.add(e)
                interestMap.put(e.relatedInterestId, set)
            }
        } else  {
            throw new IllegalArgumentException("Second Vertex Needed")
        }
    }

    public void addEdge(Long personId, Long interestId, Long relatedInterestId, Long requestId, double sim) {


        int nullCount =0
        if(interestId==null){
            nullCount++
        }
        if(personId== null){
            nullCount++
        }
        if(requestId == null){
            nullCount++
        }
        if(relatedInterestId == null){
            nullCount++
        }
        if(nullCount>=3){
            return
        }
        addEdge(new Edge(interestId: interestId, personId: personId, requestId: requestId, relatedInterestId: relatedInterestId, sim : sim))
    }

    /**
     * Increments the score of a person
     * @param pid The id of the person whose score should be incremented
     * @param iid The id of the interest associated with the score
     * @param sim The increment value to add to the score associated with
     * the person specified by parameter pid
     */
    public void incrementPersonScore(Long pid, Long iid1, Long iid2, Double sim) {
        IdAndScore is = new IdAndScore(iid1, iid2, sim)
        if (personScores.containsKey(pid)) {
            personScores[pid].add(is)
        } else {
            personScores.put(pid, [is])
        }
    }

    /**
     * Final step to creating the graph. Sorts the people by relevance, and
     * then adds the most relevant people to the graph.
     * @param maxPeople The number of people to add the the graph
     */
    public void finalizeGraph(int maxPeople) {
//        timer.startTime()
        clusterRootInterests()

        def interestCounts = [:]
        for (Set<Edge> edges : potentialPersonEdges.values()) {
            for (Edge e : edges) {
//                More expensive, and not more accurate computation
//                for (Long i : [e.relatedInterestId, e.interestId]) {
//                    if (i != null && !interestCounts.containsKey(i)) {
//                        interestCounts[i] = Interest.get(i).people.size()
//                    }
//                }

                Long i = (e.relatedInterestId != null) ? e.relatedInterestId : e.interestId
                if (!interestCounts.containsKey(i)) {
                    interestCounts[i] = 0
                }
                interestCounts[i]++
            }
        }

//        def j = interestCounts.entrySet().sort{it.value}.reverse().collect{ "${Interest.get(it.key)}:$it.value" }.join('; ')
//        println("counts are ${j}")

//        timer.recordTime("finalize 1")
        // make sure all the interests are assigned a cluster
        List<Double> allSims = []
        int numClusters = ensureAllInterestsAreClustered(allSims)

        // find similarity truncation cutoff
        allSims = allSims.findAll { it < 1.0 }
        Collections.sort(allSims)
        double maxSim = allSims[(int)((allSims.size() - 1) * 0.95)]
        maxSim = (maxSim == null) ? 1.0 : maxSim
//        timer.recordTime("finalize 2")

        // score people
        List<IdAndScore> finalPersonSims = []
        if (rootPersonId != null) {
            finalPersonSims.add(new IdAndScore(rootPersonId, Double.MAX_VALUE))
        }
        for (Long pid : personScores.keySet()) {
            double sim = scorePersonSimilarity(pid, numClusters, maxSim, interestCounts)
            finalPersonSims.add(new IdAndScore(pid, sim))
        }
//        timer.recordTime("finalize 3")
        Collections.sort(finalPersonSims)

        // prune personMap
        personMap.clear()
        for (IdAndScore personAndSim : finalPersonSims) {
            personMap.put(personAndSim.id, potentialPersonEdges.get(personAndSim.id))
            if (personMap.size() > maxPeople) {
                break
            }
        }
//        timer.recordTime("finalize 4")
//        timer.analyze()
    }

    /**
     * Returns the overall similarity score for a particular person.
     * @param pid
     * @param clusterCoefficient
     * @param maxSim
     * @return
     */
    private double scorePersonSimilarity(long pid, int numClusters, double maxSim, Map<Long, Integer>interestCounts) {
        double sim = 0.0
//        println("calculating sim for ${Person.get(pid)}")
        Set<Long> used = new HashSet<Long>()
        double[] clusterCoefficient = new double[numClusters];
        for (IdAndScore interestAndSim: personScores[pid]) {
            interestAndSim.score = (interestAndSim.score == 1.0) ? maxSim * 3.0 : Math.min(maxSim, interestAndSim.score)
            List<Double> dfs = []
            if (interestAndSim.id != null) {
                dfs.add(interestCounts[interestAndSim.id])
            }
            if (interestAndSim.id2 != null) {
                dfs.add(interestCounts[interestAndSim.id2])
            }
            if (dfs.size() != 0) {
                interestAndSim.score /= Math.sqrt(dfs.max())
            }
//            println("\tinterest ${Interest.get(interestAndSim.id)}  ${Interest.get(interestAndSim.id2)}  ${interestAndSim.score} penalized by ${dfs.sum()}")

        }
        Collections.sort(personScores[pid])
        Arrays.fill(clusterCoefficient, 1.0)
        for (IdAndScore interestAndSim: personScores[pid]) {
            if ((used.contains(interestAndSim.id))
                    || (interestAndSim.id2 != null && used.contains(interestAndSim.id2))) {
                continue
            }
            int c = interestClusters[interestAndSim.id]
//              println("interestAndSim is ${interestAndSim} cluster is " + c)
            double s = interestAndSim.score
            s *= clusterCoefficient[c]
            sim += s
//            println("\tinterest ${Interest.get(interestAndSim.id)}  ${Interest.get(interestAndSim.id2)}  ${interestAndSim.score} contributing ${s}")
            clusterCoefficient[c] *= CLUSTER_PENALTY

            used.add(interestAndSim.id)
            if (interestAndSim.id2 != null) {
                used.add(interestAndSim.id2)
            }
        }
//        println("\tfinal score is ${sim}")

        return sim
    }

    /**
     * Ensures that all interests in personScores are associated with a cluster
     * @param allSims A list populated with all similarities.
     * @return number of unique clusters
     */
    private int ensureAllInterestsAreClustered(List<Double> allSims) {
        int numClusters = interestClusters.isEmpty() ? 0 : (interestClusters.values().max() + 1)
        for (Long pid : personScores.keySet()) {
            for (IdAndScore interestAndSim : personScores[pid]) {
                allSims.add(interestAndSim.score)
                if (!interestClusters.containsKey(interestAndSim.id)) {
                    interestClusters[interestAndSim.id] = numClusters++
//                    println("interestAndSim is ${interestAndSim} has no cluster.")
                }
            }
        }
        return numClusters
    }

    /**
     *
     * @param person the person whose adjacent edges are needed
     * @return edges with the input person as one vertex
     */
    public Set<Edge> getAdjacentEdges (Person person) {
        personMap.get(person.id, new HashSet())
    }

    /**
     *
     * @param interest the interest for which adjacent edges are needed
     * @return edges with the input interest as one vertex.
     */
    public Set<Edge> getAdjacentEdges (Interest interest) {
        interestMap.get(interest.id, new HashSet())
    }


    /**
     *
     * @param interest the collaborator request for which adjacent edges are needed
     * @return edges with the input collaborator request as one vertex.
     */
    public Set<Edge> getAdjacentEdges (CollaboratorRequest request) {
        requestMap.get(request.id, new HashSet())
    }

    /**
     *
     * @return the set of people who are vertices in the graph
     */
    public Set<Person> getPeople() {
        Set<Person> result = new HashSet<Person>()
        for (Long id : personMap.keySet()) {
            Person p = Person.get(id)
            if (p == null) {
                LOG.error("getPeople(): no person with id ${id}")
            } else {
                result.add(p)
            }
        }
        return result
    }

    /**
     *
     * @return the set of interests that are vertices in the graph
     */
    public Set<Interest> getInterests() {
        Set<Interest> result = new HashSet<Interest>()
        for (Long id : interestMap.keySet()) {
            Interest i = Interest.get(id)
            if (i == null) {
                LOG.error("getInterests(): no interest with id ${id}")
            } else {
                result.add(i)
            }
        }
        return result
    }

    public Set<CollaboratorRequest> getRequests(){
        Set<CollaboratorRequest> result = new HashSet<CollaboratorRequest>()
        for (Long id : requestMap.keySet()) {
            CollaboratorRequest r = CollaboratorRequest.get(id)
            if (r == null) {
                LOG.error("getRequests(): no collaborator request with id ${id}")
            } else {
                result.add(r)
            }
        }
        return result
    }

    /**
     *
     * @param person checks whether this person is in the graph
     * @return returns true if the person is in the graph
     */
    public boolean containsNode(Person person){
        return personMap.containsKey(person.id)
    }

    /**
     *
     * @param interest checks whether this interest is in the graph
     * @return returns true if the interest is in the graph
     */
    public boolean containsNode(Interest interest){
        return interestMap.containsKey(interest.id)
    }

    public boolean containsNode(CollaboratorRequest request){
        return requestMap.containsKey(request.id)
    }


    /**
     *
     * @return the number of edges between the people and interests in the graph
     */
    public int edgeSize(){
        return edges
    }

    public boolean containsInterestId(long id) {
        return interestMap.containsKey(id)
    }

    public boolean containsPersonId(long id) {
        return personMap.containsKey(id)
    }

    public boolean containsRequestId(long id) {
        return requestMap.containsKey(id)
    }

    public void addIntraInterestSim(Long i1, Long i2, double sim) {
        if (!intraInterestSims.containsKey(i1)) {
            intraInterestSims[i1] = [:]
        }
        if (!intraInterestSims.containsKey(i2)) {
            intraInterestSims[i2] = [:]
        }
        intraInterestSims[i1][i2] = sim
        intraInterestSims[i2][i1] = sim
    }

    public void clusterRootInterests() {
        List<Set<Long>> clusters = []
        for (Long i : intraInterestSims.keySet()) {
            clusters.add(new HashSet<Long>([i]))
        }

        // create a string representation of clusters
//        def f = {
//            cs ->
//            cs.collect({
//                ids ->
//                "[" + ids.collect({Interest.get(it).normalizedText}).join(", ") + "]"
//            }).join("         ")
//        }

        // find closest pair of clusters and merge
        while (clusters.size() > 1) {

            def closest = null
            def closestSim = -1.0

            for (Set<Long> c1 : clusters) {
                for (Set<Long> c2 : clusters) {
                    if (c1 != c2) {
                        def s = clusterSimilarity(c1, c2)
                        if (s > closestSim) {
                            closest = [c1, c2]
                            closestSim = s
                        }
                    }
                }
            }


            if (closestSim < MIN_CLUSTER_SIM) {
                break
            }
            clusters.remove(closest[0])
            closest[1].addAll(closest[0])
        }

        interestClusters.clear()
        for (int c = 0; c < clusters.size(); c++) {
            for (Long interestId : clusters[c]) {
                interestClusters[interestId] = c
            }
        }

//        println("clusters are ${clusters} with names ${f(clusters)}")

    }

    public double clusterSimilarity(Collection<Long> cluster1, Collection<Long> cluster2) {
        if (cluster1.size() == 0 || cluster2.size() == 0) {
            return 0.0
        }
        double sim = 0.0
        for (Long i1 : cluster1) {
            for (Long i2 : cluster2) {
                if (intraInterestSims.containsKey(i1) && intraInterestSims[i1].containsKey(i2)) {
                    sim += intraInterestSims[i1][i2]
                }
            }
        }
        return sim / (cluster1.size() * cluster2.size())
    }

    public boolean isPersonCenteredGraph() {
        return rootPersonId != null
    }

    /*
    public boolean containsEdge(Person person, Interest interest){
        Edge edge=new Edge(person:person, interest:interest)
        if(interestMap.containsKey(interest) && personMap.containsKey(Person)){
            return interestMap.get(person).contains(edge)
        }

        return false
    }

    public boolean containsEdge(Interest interest1, Interest interest2){
        Edge edge=new Edge(interest:interest1, relatedInterest:interest2)
        if(interestMap.containsKey(interest1) && interestMap.containsKey(interest2)){
            return interestMap.get(interest1).contains(edge)
        }
        return false
    }*/
}
