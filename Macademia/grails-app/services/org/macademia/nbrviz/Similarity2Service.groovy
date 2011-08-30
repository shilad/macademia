package org.macademia.nbrviz

import org.macademia.*

/**
 * An extension of SimilarityService, provides neighbor algorithms
 * for the new query and exploration visualizations.
 */
class Similarity2Service extends SimilarityService {

    def interestService

    /**
     * Creates and returns a new Graph based upon the parameter set
     * of query Interests for the query visualization.
     * @param qset A Set<Long> of interests ids forming the query.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public NbrvizGraph calculateQueryNeighbors(Set<Long> qset) {
        int maxPeople = Integer.MAX_VALUE
        NbrvizGraph graph = new NbrvizGraph()
        for (long q : qset){
            Interest qi = interestService.get(q)
            graph = calculateNeighbors(qi.id, graph, maxPeople, qset, null) as NbrvizGraph
        }
        graph.finalizeGraph(20)
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
     public Graph calculateNeighbors(Long i, Graph graph, int maxPeople, Set<Long> inner, Set<Long> institutionFilter) {
         if(i == null){
             return graph
         }
         //Add all edges linked to Interest i
         graph = findPeopleAndRequests(graph, maxPeople, i, null, 1, institutionFilter)
         def simInterests = getSimilarInterests(i, 1000, 0, institutionFilter)
         println("found ${simInterests.size()} similar to ${Interest.get(i)}")
         for(SimilarInterest ir : simInterests){
             if(ir.interestId!=null){
                 if(inner.contains(ir.interestId)) {
                     graph.addIntraInterestSim(i, ir.interestId, ir.similarity)
                 } else {
                     //Add all edges linked to SimilarInterest ir
                     graph.addOtherInterestSim(i, ir.interestId, ir.similarity)
                     graph = findPeopleAndRequests(graph, maxPeople, i, ir.interestId, ir.similarity, institutionFilter)
                 }
             }
         }
         return graph
     }


}
