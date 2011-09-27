package org.macademia.nbrviz

import org.macademia.*
import grails.plugin.springcache.annotations.Cacheable

/**
 * An extension of SimilarityService, provides neighbor algorithms
 * for the new query and exploration visualizations.
 */
class Similarity2Service {

    def similarityService
    def interestService
    def databaseService
    static double IDENTITY_SIM = 0.7
    private static final double MAX_UNCLUSTERED_SIM = 0.1
    private static final double MIN_CLUSTER_SIM = 0.005
    private static final int IDEAL_NUM_CLUSTERS = 7
    private static final int MAX_SIM_INTERESTS = IDEAL_NUM_CLUSTERS * 4
    private static final int MAX_CLUSTER_SIZE = 6

    /**
     * Creates and returns a new Graph based upon the parameter set
     * of query Interests for the query visualization.
     * @param qset A Set<Long> of interests ids forming the query.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public QueryVizGraph calculateQueryNeighbors(Set<Long> qset, Map<Long, Double> weights, int maxNeighbors) {
        TimingAnalysis ANALYSIS = new TimingAnalysis('calculateQueryNeighbors')
        QueryVizGraph graph = new QueryVizGraph(qset)

        // Calculate interest clusters
        ANALYSIS.startTime()
        for (long q : qset){
            def simInterests = similarityService.getSimilarInterests(q, 500, 0)
            simInterests.normalize()
            graph.incorporateQuerySimilarities(q, weights[q], simInterests)
        }
        ANALYSIS.recordTime("interest clusters")

        // find people with those clusters
        Map<Long, Set<Long>> personInterests = [:]
        for (Long iid : graph.interestInfo.keySet()) {
            for (Long pid : databaseService.getInterestUsers(iid)) {
                if (!personInterests.containsKey(pid)) {
                    personInterests[pid] = new HashSet<Long>()
                }
            }
        }
        ANALYSIS.recordTime("people1")

        // Add people to the graph
        for (Long pid : personInterests.keySet()) {
            graph.addPerson(pid, databaseService.getUserInterests(pid))
        }
        ANALYSIS.recordTime("people2")

        for (Long q : qset){
            for (Long iid : chooseTopRelatedInterests(q, IDEAL_NUM_CLUSTERS)) {
                def simInterests = new SimilarInterestList()
//                def simInterests = similarityService.getSimilarInterests(iid, 500, 0)
//                simInterests.normalize()
                graph.addQuerySubCluster(q, iid, simInterests)
            }
        }
        ANALYSIS.recordTime("subcluster")

        // Calculate scores, prune graph, etc
        graph.finalizeGraph(maxNeighbors)
        ANALYSIS.recordTime("finalize")
        ANALYSIS.analyze()

        return graph
    }

    /**
     * Creates and returns a new Graph based upon the parameter Person for
     * the exploration visualization.
     * @param root The root Person of the exploration visualization.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public Graph calculateExplorationNeighbors(Person root) {
        int maxPeople = Integer.MAX_VALUE
        NbrvizGraph graph= new NbrvizGraph(root.id)
        def interests = databaseService.getUserInterests(root.id)
        for(long i : interests){
            //For each interest owned by the central person, calculate neighbors
            graph = calculateNeighbors(i, graph, maxPeople, (Set<Long>)root.interests.collect({it.id}), null) as NbrvizGraph
        }
        graph.finalizeGraph(maxPeople)
        return graph
    }

    /**
     * Creates and returns a new Graph based upon the parameter Interest for
     * the exploration visualization.
     * @param root The root Interest of the exploration visualization.
     * @param maxPeople The max number of people to include in the Graph.
     * @param maxInterests The max number of Interests to include in the Graph.
     * @return A Graph
     */
    public Graph calculateExplorationNeighbors( Interest root) {
        int maxPeople = Integer.MAX_VALUE
        int maxInterests = Integer.MAX_VALUE
        NbrvizGraph graph = new NbrvizGraph()
        graph = findPeopleAndRequests(graph, maxPeople, root.id, null, 1, null) as NbrvizGraph
        for(SimilarInterest ir : getSimilarInterests(root.id, maxInterests, absoluteThreshold, null)){
            graph.addEdge(null, root.id, ir.interestId, null, ir.similarity)
            graph = findPeopleAndRequests(graph, maxPeople, ir.interestId, null, ir.similarity, null) as NbrvizGraph
        }
        graph.finalizeGraph(maxPeople)
        return graph
    }

    /**
     * Finds the branches off of an interest node in a graph centered on a request or a person.
     * @param i Id of the interest to calculate neighbors for
     * @param graph The graph to add the resultant edges to
     * @param maxPeople The maximum number of people who should be added to the graph
     * @param inner the interests that should be on the inner ring
     * @param institutionFilter
     * @return The graph with all conections to Interest i added
     */
     public NbrvizGraph calculateNeighbors(Long i, NbrvizGraph graph, int maxPeople, Set<Long> inner) {
         if(i == null){
             return graph
         }
         //Add all edges linked to Interest i
         graph = findPeople(graph, maxPeople, i, null, 1)
         def simInterests = similarityService.getSimilarInterests(i, 1000, 0)
         simInterests.normalize()
//         println("found ${simInterests.size()} similar to ${Interest.get(i)}")
         for(SimilarInterest ir : simInterests){
             if(ir.interestId!=null){
                 if(inner.contains(ir.interestId)) {
                     graph.addIntraInterestSim(i, ir.interestId, ir.similarity)
                 } else {
                     //Add all edges linked to SimilarInterest ir
                     graph.addOtherInterestSim(i, ir.interestId, ir.similarity)
                     graph = findPeople(graph, maxPeople, i, ir.interestId, ir.similarity)
                 }
             }
         }
         return graph
     }


    /**
     * Adds edges to the parameter graph between an Interest or SimilarInterest and all people who own
     * that Interest or SimilarInterest.
     * @param graph The graph to be modified
     * @param maxPeople The maximum number of people to add to the graph
     * @param i Id number of an Interest whose connections need to be added to the graph
     * @param ir Id number of a SimilarInterest whose connections need to added to the graph
     * @param sim The similarity score between i and ir. If ir is null, sim should be 1
     * @return The graph with all appropriate edges added.
     */
    public NbrvizGraph findPeople(NbrvizGraph graph, int maxPeople, Long i, Long ir, Double sim) {
        Long interestId = (ir == null) ? i : ir
        def userIds = databaseService.getInterestUsers(interestId)
        for(long p : userIds){
            graph.incrementPersonScore(p, i, interestId, sim)
            graph.addEdge(p, i, ir, null, sim)
        }
        return graph
    }


    @Cacheable('simServiceCache')
    public Set<Long> chooseTopRelatedInterests(Long interestId, int numResults) {
        // Subset of related interests
        SimilarInterestList sil = databaseService.getSimilarInterests(interestId)
        if (sil.size() > numResults*8) { sil = sil.getSublistTo(numResults*8) }
        Set<Long> interests = new HashSet<Long>(sil.list.interestId)

        // co-occurrence counts for related interests
        Map<Long, Integer> counts = [:]
        for (Long pid : databaseService.getInterestUsers(interestId)) {
            for (Long iid : databaseService.getUserInterests(pid)) {
                counts[iid] = counts.get(iid, 0) + 1
            }
        }
        // popularity score
        Map<Long, Double> popularity = [:]
        for (Iterator<Long> i = interests.iterator(); i.hasNext();) {
            Long iid = i.next()
            int p1 = counts.get(iid, 0)
            int p2 = interestService.getInterestCount(iid)
            if (p1 < 2 && p2 < 2) {
                i.remove()
                counts.remove(iid)
            } else {
                popularity[iid] = (Math.log(p1 + 1) + Math.log(p2 + 1)) / Math.log(2)
            }
        }

        // Relevances to root interest
        Map<Long, Double> rels = [:]
        sil.list.each({rels[it.interestId] = it.similarity})

        // Similarities between interests, and similarities of each to the current selected set
        Map<Long, Map<Long, Double>> intraSims = databaseService.getIntraInterestSims(interests, false)
        Map<Long, Double> sims = [:]
        interests.each({sims[it] = 0.001})

        Set<Long> remaining = new HashSet<Long>(interests)  // copy it
        List<Long> centers = []
        while (centers.size() < numResults && remaining.size() > 0) {
            Long lastId = centers.isEmpty() ? null : centers.last()
            double alpha = 1.0 / (centers.size() + 1)
            double bestScore = -1
            Long bestId = null
            for (Iterator<Long> i = remaining.iterator(); i.hasNext();) {
                Long iid = i.next()
                if (lastId != null) {
                    double lastSim = intraSims[iid].get(lastId, 0.01)
                    if (lastSim > 0.10) {
                        i.remove()
                        continue
                    }
//                    sims[iid] = alpha * intraSims[iid].get(lastId, 0.01) + (1.0 - alpha) * sims[iid]
                    sims[iid] = Math.max(intraSims[iid].get(lastId, 0.01), sims[iid])
                }
                double score = (1.0 / (sims[iid] + 0.15)) * (popularity[iid] + 1) * rels[iid]
//                println("${centers.size()} interest: ${Interest.get(iid).text}, score: $score, sim: ${sims[iid]}, pop: ${popularity[iid]}, rel: ${rels[iid]}")
                if (score > bestScore) {
                    bestScore = score
                    bestId = iid
                }
            }
            if (bestId == null) {
                break;
            }
            remaining.remove(bestId)
            centers.add(bestId)
        }
        return new HashSet<Long>(centers)
    }

    /**
     * Given a set of interests, form a set of clusters containing those interests.
     * @param ids
     * @return
     */
    public Collection<Set<Long>> clusterInterests(Set<Long> iids) {
//        println("iids are $iids")
        List<Set<Long>> clusters = []
        Map<Long, Map<Long, Double>> sims = getIntraInterestSims(iids)

        for (Long i : sims.keySet()) {
            if (sims.containsKey(i)) {
                clusters.add(new HashSet<Long>([i]))
            }
        }

        // find closest pair of clusters and merge
        while (clusters.size() > 1) {

            def closest = null
            def closestSim = -1.0

            for (Set<Long> c1 : clusters) {
                for (Set<Long> c2 : clusters) {
                    if (Math.min(c1.size(), c2.size()) > 1 && Math.max(c1.size(), c2.size()) >= MAX_CLUSTER_SIZE) {
                        continue
                    }
                    if (c1 != c2) {
                        def s = clusterSimilarity(sims, c1, c2)
                        if (s > closestSim) {
                            closest = [c1, c2]
                            closestSim = s
                        }
                    }
                }
            }
            if ((closestSim < MIN_CLUSTER_SIM)  // don't cluster anything worse than this
            ||  (closestSim < MAX_UNCLUSTERED_SIM && clusters.size() <= IDEAL_NUM_CLUSTERS)) { // only use if necessary
                break
            }
            clusters.remove(closest[0])
            closest[1].addAll(closest[0])
        }
        String desc = clusters.collect({describeCluster(it)}).join(", ")
        for (int i = 0; i < clusters.size(); i++) {
            println("cluster $i is ${describeCluster(clusters[i])}")
        }

        return clusters
    }

    public double clusterSimilarity(Map<Long, Map<Long, Double>> sims, Collection<Long> cluster1, Collection<Long> cluster2) {
        if (cluster1.size() == 0 || cluster2.size() == 0) {
            return 0.0
        }
        double sim = 0.0
        for (Long i1 : cluster1) {
            for (Long i2 : cluster2) {
                if (sims.containsKey(i1) && sims[i1].containsKey(i2)) {
                    sim += sims[i1][i2]
                }
            }
        }
        return sim / (cluster1.size() * cluster2.size())
    }

    public String describeCluster(Set<Long> ids) {
        StringBuffer res = new StringBuffer("[")
        for (Long iid : ids) {
            Interest i = Interest.get(iid)
            String name = (i == null) ? ""+iid : "${i.id}:${i.text}"
            res.append(name)
            res.append(", ")
        }
        res.append("]")
        return res.toString()
    }
}
