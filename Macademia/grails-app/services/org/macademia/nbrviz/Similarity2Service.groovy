package org.macademia.nbrviz

import org.macademia.*

/**
 * An extension of SimilarityService, provides neighbor algorithms
 * for the new query and exploration visualizations.
 */
class Similarity2Service {

    def similarityService
    def interestService
    def databaseService
    static double IDENTITY_SIM = 0.7

    /**
     * Creates and returns a new Graph based upon the parameter set
     * of query Interests for the query visualization.
     * @param qset A Set<Long> of interests ids forming the query.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public QueryVizGraph calculateQueryNeighbors(Set<Long> qset, int maxNeighbors) {
        TimingAnalysis ANALYSIS = new TimingAnalysis()
        QueryVizGraph graph = new QueryVizGraph(qset)

        // Calculate interest clusters
        ANALYSIS.startTime()
        for (long q : qset){
            def c = graph.queryIdsToClusters[q]
            graph.addRelatedInterest(q, c, IDENTITY_SIM);
            def simInterests = similarityService.getSimilarInterests(q, 500, 0)
            simInterests.normalize()
            for (SimilarInterest ir : simInterests){
                graph.addRelatedInterest(ir.interestId, c, ir.similarity)
            }
        }
        ANALYSIS.recordTime("interest clusters")

        // find people with those clusters
        Map<Long, Set<Long>> personInterests = [:]
        for (Long iid : graph.interestClusters.keySet()) {
            for (Long pid : databaseService.getInterestUsers(iid)) {
                if (!personInterests.containsKey(pid)) {
                    personInterests[pid] = new HashSet<Long>()
                }
                personInterests[pid].add(iid)
            }
        }
        ANALYSIS.recordTime("people1")

        // Add people to the graph
        for (Long pid : personInterests.keySet()) {
            graph.addPerson(pid, personInterests[pid])
        }
        ANALYSIS.recordTime("people2")

        // Calculate scores, prune graph, etc
        graph.finalizeGraph(maxNeighbors)
        ANALYSIS.recordTime("finalize")
        for (Long pid : graph.personClusterEdges.keySet()) {
            graph.ensureAllInterestsExist(pid, databaseService.getUserInterests(pid))
        }
        ANALYSIS.recordTime("ensure")
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
}
