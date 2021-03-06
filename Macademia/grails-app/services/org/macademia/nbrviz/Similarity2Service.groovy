package org.macademia.nbrviz

import org.macademia.*
import gnu.trove.list.array.TIntArrayList
//import grails.plugin.springcache.annotations.Cacheable

/**
 * Provides neighbor algorithms for the new query and exploration visualizations.
 */
class Similarity2Service {

    def interestService
    def databaseService
    def similarityService
    def semanticSimilarityService

    /**
     * Creates and returns a new Graph based upon the parameter Person for
     * the exploration visualization.
     * @param root The root Person of the exploration visualization.
     * @param maxPeople The max number of people to include in the Graph.
     * @return A Graph
     */
    public PersonGraph calculatePersonNeighbors(Long rootId, int maxPeople, int maxInterests, Map<Long, Double> interestWeights) {

        TimingAnalysis ANALYSIS = new TimingAnalysis('calculatePersonNeighbors')
        PersonGraph graph = new PersonGraph(rootId, interestWeights)

        TIntArrayList userInterests = new TIntArrayList()
        databaseService.getUserInterests(rootId).each({userInterests.add(it as int)})
        for (int id : userInterests.toArray()) {
            graph.addRootPersonInterestSimilarities(id as long,
                    semanticSimilarityService.mostSimilar(id))
        }
        graph.addRootPersonInterests(userInterests.toArray(),
                semanticSimilarityService.cosimilarity(userInterests.toArray()))
        ANALYSIS.recordTime("add root interests")

        graph.chooseClusterRoots(maxInterests)
        ANALYSIS.recordTime("cluster root")


        for (Long id : graph.getInterestsNeedingSims()) {
            graph.addSimilarInterests(id, semanticSimilarityService.mostSimilar(id as int))
        }
        ANALYSIS.recordTime("add similar interest")

        graph.fillClusters()
        ANALYSIS.recordTime("fill clusters")
        graph.prettyPrint()

        // find people with those clusters
        for (Long id : graph.getInterestsToFindUsers()) {
            for (Long pid : databaseService.getInterestUsers(id)) {
                if (!graph.hasPerson(pid)) {
                    graph.addPerson(pid, databaseService.getUserInterests(pid))
                }
            }
        }
        ANALYSIS.recordTime("add related people")

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

        TimingAnalysis ANALYSIS = new TimingAnalysis('calculate interest neighbors')
        InterestGraph graph = new InterestGraph(rootId, interestWeights)
        for (SimilarInterest si : semanticSimilarityService.mostSimilar(rootId as int)) {
            graph.addSimilarInterests(si.interestId, semanticSimilarityService.mostSimilar(si.interestId as int))
        }
        ANALYSIS.recordTime("add root similar interests")

        graph.chooseClusterRoots(maxInterests)
        ANALYSIS.recordTime("cluster root")

        for (Long id : graph.getInterestsNeedingSims()) {
            graph.addSimilarInterests(id, semanticSimilarityService.mostSimilar(id as int))
        }
        ANALYSIS.recordTime("add similar interest")

        graph.fillClusters()
        ANALYSIS.recordTime("fill clusters")
        graph.prettyPrint()

        // find people with those clusters
        for (Long id : graph.getInterestsToFindUsers()) {
            for (Long pid : databaseService.getInterestUsers(id)) {
                if (!graph.hasPerson(pid)) {
                    graph.addPerson(pid, databaseService.getUserInterests(pid))
                }
            }
        }
        ANALYSIS.recordTime("add related people")

        // Calculate scores, prune graph, etc
        graph.finalizeGraph(maxPeople)
        ANALYSIS.recordTime("finalize")
        ANALYSIS.analyze()

        return graph
    }

}
