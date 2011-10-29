package org.macademia.nbrviz

import org.macademia.*
import grails.plugin.springcache.annotations.Cacheable

/**
 * Provides neighbor algorithms for the new query and exploration visualizations.
 */
class Similarity2Service {

    def interestService
    def databaseService
    def similarityService
    static double IDENTITY_SIM = 0.7
    private static final double MAX_UNCLUSTERED_SIM = 0.9
    private static final double MIN_CLUSTER_SIM = 0.005
    private static final int IDEAL_NUM_CLUSTERS = 7
    private static final int MAX_CLUSTER_SIZE = 6

    /**
     * Creates and returns a new Graph based upon the parameter set
     * of query Interests for the query visualization.
     * @param qset A Set<Long> of interests ids forming the query.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public QueryGraph calculateQueryNeighbors(Set<Long> qset, Map<Long, Double> weights, int maxNeighbors) {
        TimingAnalysis ANALYSIS = new TimingAnalysis('calculateQueryNeighbors')
        QueryGraph graph = new QueryGraph(qset)

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
            for (Long iid : chooseTopRelatedInterests(q, IDEAL_NUM_CLUSTERS, 1.0, [:]).keySet()) {
                graph.addQueryRelatedInterests(q, iid)
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
    public PersonGraph calculatePersonNeighbors(Long rootId, int maxPeople, int maxInterests, Map<Long, Double> interestWeights) {

        TimingAnalysis ANALYSIS = new TimingAnalysis('calculatePersonNeighbors')
        PersonGraph graph = new PersonGraph(rootId, databaseService.getUserInterests(rootId))

        // Calculate interest clusters
        ANALYSIS.startTime()
        Map<Long, Set<Long>> clusters = clusterInterests2(graph.rootInterests, maxInterests)
        ANALYSIS.recordTime("cluster root interests")

        println("clusters:")
        for (Long iid : clusters.keySet()) {
            SimilarInterestList sil = databaseService.getSimilarInterests(iid)
            sil.normalize()
            graph.addRelatedInterest(iid, interestWeights.get(iid, 0.5), clusters[iid], sil)
            println("\t" + graph.describeCluster(clusters[iid]))
        }
        ANALYSIS.recordTime("find related interests")

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

        // Calculate scores, prune graph, etc
        graph.finalizeGraph(maxPeople)
        ANALYSIS.recordTime("finalize")
        ANALYSIS.analyze()

        return graph
    }


    /**
     * Creates and returns a new Graph based upon the parameter Interest for
     * the exploration visualization.
     * @param rootId The root Interest of the exploration visualization.
     * @param maxPeople The max number of people to include in the Graph.
     * @param maxInterests The max number of Interests to include in the Graph.
     * @return A Graph
     */
    public InterestGraph calculateInterestNeighbors(Long rootId, int maxPeople, int maxInterests, Map<Long, Double> interestWeights) {

        TimingAnalysis ANALYSIS = new TimingAnalysis('calculatePersonNeighbors')
        InterestGraph graph = new InterestGraph(rootId)

        // Calculate interest clusters
        ANALYSIS.startTime()
        Map<Long, Double> related = chooseTopRelatedInterests(rootId, maxInterests, 0.5, [:])
        ANALYSIS.recordTime("choose related interests")
        related[rootId] = 1.0; interestWeights[rootId] = 1.0;  // Hacks

        Map<Long, Double> penalties = [:]   // between 0 (low) and 1 (high)
        related.keySet().each({penalties[it] = 1.0 })

        def relatedIds = related.keySet().asList().sort({ -1 * related[it] })
        for (long rid : relatedIds){
            def sil = similarityService.getSimilarInterests(rid, 500, 0)
            sil.normalize()
            double simWeight = (rid == rootId) ? 4.0 : 2.0
            Set<Long> displayedIds = chooseTopRelatedInterests(rid, IDEAL_NUM_CLUSTERS, simWeight, penalties).keySet()
            if (rid != rootId) {
                displayedIds.each({ penalties[it] = 0.5 + penalties.get(it, 0) * 0.5 })
            }
            graph.addRelatedInterest(rid, interestWeights.get(rid, 0.5), displayedIds, sil)
        }
        ANALYSIS.recordTime("related interest clusters")

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

        // Calculate scores, prune graph, etc
        graph.finalizeGraph(maxPeople);
        ANALYSIS.recordTime("finalize")
        ANALYSIS.analyze()

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
    public Map<Long, Double> chooseTopRelatedInterests(Long interestId, int numResults, double simWeight, Map<Long, Double> penalties) {
        // Subset of related interests
        SimilarInterestList sil = databaseService.getSimilarInterests(interestId)
//        if (sil.size() > numResults*8) { sil = sil.getSublistTo(numResults*8 as int) }
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
        print("length of interests went from ${interests.size()}")
        for (Iterator<Long> i = interests.iterator(); i.hasNext();) {
            Long iid = i.next()
            int p1 = counts.get(iid, 0)
            int p2 = interestService.getInterestCount(iid)
//            if (p1 < 2 && p2 < 2) {
//                i.remove()
//                counts.remove(iid)
//            } else {
                popularity[iid] = (Math.log(p1 + 1) + Math.log(p2 + 1)) / Math.log(2)
//            }
        }
        println(" to ${interests.size()}")

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
//            double alpha = 1.0 / (centers.size() + 1)
            double bestScore = -1
            Long bestId = null
            for (Iterator<Long> i = remaining.iterator(); i.hasNext();) {
                Long iid = i.next()
                if (lastId != null) {
                    double lastSim = intraSims[iid].get(lastId, 0.01)
//                    if (lastSim > 0.10) {
//                        i.remove()
//                        continue
//                    }
//                    sims[iid] = alpha * intraSims[iid].get(lastId, 0.01) + (1.0 - alpha) * sims[iid]
                    sims[iid] = Math.max(intraSims[iid].get(lastId, 0.01), sims[iid])
                }
                double intraSimTerm = (1.0 / (sims[iid] + 0.15))
                double relTerm = Math.pow(rels[iid], simWeight)
                double popularityTerm = popularity[iid] + 1
                double penaltyTerm = (1.0 - penalties.get(iid, 0))
                double score = intraSimTerm * popularityTerm * relTerm * penaltyTerm
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
        println("centers for $interestId are $centers" )
        rels.keySet().retainAll(centers)
        return rels
    }

    /**
     * Given a set of interests, form a set of clusters containing those interests.
     * @param ids
     * @return
     */
    public Map<Long, Set<Long>> clusterInterests2(Set<Long> iids, int maxNumClusters) {
//        println("iids are $iids")
        Map<Long, Map<Long, Double>> sims = databaseService.getIntraInterestSims(iids, false)
        Map<Long, Long> closest = [:]
        for (Long iid : sims.keySet()) {
            double maxSim = sims[iid].values().max()
            Long iid2 = sims[iid].entrySet().find({
                it.value == maxSim && it.key != iid
            })?.key
            closest[iid] = iid2
        }

        List<Set<Long>> clusters = []
        List<Long> remaining = iids.findAll({closest.containsKey(it)}).asList()  // copy it
        remaining.sort({sims[it][closest[it]]})

        while (remaining.size() > 0) {
            Long iid = remaining.pop()
            Long iid2 = closest[iid]
            if (iid2 in remaining) {
                clusters.add(new HashSet([iid, iid2]))
                remaining.remove(iid2)
            } else {
                for (Set<Long> c : clusters) {
                    if (c.contains(iid2)) {
                        c.add(iid)
                        break
                    }
                }
            }
        }

        if (clusters.size() > maxNumClusters) {
            clusters = clusters.subList(0, maxNumClusters)
        } else if (clusters.size() < maxNumClusters) {
            Collection<Long> used = clusters.flatten()
            for (Long iid : iids) {
                // TODO: order these by popularity
                if (clusters.size() == maxNumClusters) {
                    break
                }
                if (!used.contains(iids)) {
                    clusters.add(new HashSet([iid]))
                }
            }
        }

        Map<Long, Integer> counts = [:]
        iids.each({counts[it] = interestService.getInterestCount(it)})

        // FIXME:
        Map<Long, Set<Long>> clusterMap = [:]
        for (Set<Long> c : clusters) {
            List<Long> cByCount = c.asList()
            cByCount.sort({-1 * (counts[it] ? counts[it] : 0)})
            Long cRoot = cByCount[0]
            clusterMap[cRoot] = c
        }

        return clusterMap
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
}
