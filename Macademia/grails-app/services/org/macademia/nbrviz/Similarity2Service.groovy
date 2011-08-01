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
            graph = calculateNeighbors(qi.id, graph, maxPeople, qset, null)
        }
        graph.finalizeGraph(50)
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
            graph = calculateNeighbors(i, graph, maxPeople, (Set<Long>)root.interests.collect({it.id}), null)
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
        graph = findPeopleAndRequests(graph, maxPeople, root.id, null, 1, null)
        for(SimilarInterest ir : getSimilarInterests(root.id, maxInterests, absoluteThreshold, null)){
            graph.addEdge(null, root.id, ir.interestId, null, ir.similarity)
            graph = findPeopleAndRequests(graph, maxPeople, ir.interestId, null, ir.similarity, null)
        }
        graph.finalizeGraph(maxPeople)
        return graph
    }

}
