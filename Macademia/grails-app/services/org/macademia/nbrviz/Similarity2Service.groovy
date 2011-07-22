package org.macademia.nbrviz

import org.macademia.*

class Similarity2Service {

    def similarityService
    def interestService


    public Graph calculateQueryNeighbors( Set<Long> qset, int maxPeople){
        return calculateQueryNeighbors(qset, maxPeople, null)
    }
    public Graph calculateQueryNeighbors( Set<Long> qset, int maxPeople, Set<Long> institutionFilter){
        Graph graph = new Graph()
        for (long q : qset){
            Interest qi = interestService.get(q)
            graph = similarityService.calculateNeighbors(qi.id, graph, maxPeople, qset, institutionFilter)
        }
        graph.finalizeGraph(maxPeople)
        return graph
    }

    public Graph calculateExplorationNeighbors( Person root, int maxPeople){
        return calculateExplorationNeighbors(root, maxPeople, null)
    }

    public Graph calculateExplorationNeighbors( Interest root, int maxPeople, int maxInterests){
        return similarityService.calculateInterestNeighbors(root, maxPeople, maxInterests)
    }

    public Graph calculateExplorationNeighbors( Person root, int maxPeople, Set<Long> institutionFilter){
        return similarityService.calculatePersonNeighbors(root, maxPeople, institutionFilter)
    }

    public Graph calculateExporationNeighbors(Interest root, int maxPeople, int maxInterests, Set<Long> institutionFilter){
        return similarityService.calculateInterestNeighbors(root, maxPeople, maxInterests, institutionFilter)
    }


}
