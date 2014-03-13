package org.macademia.nbrviz

import gnu.trove.list.TIntList
import gnu.trove.set.TIntSet
import gnu.trove.set.hash.TIntHashSet
import org.macademia.*
import gnu.trove.list.array.TIntArrayList
import org.macademia.graph.ClusterMap
import org.macademia.graph.MacademiaGraph
import org.macademia.graph.NodeType
import org.sr.ClusterMapBuilder

//import grails.plugin.springcache.annotations.Cacheable

/**
 * Provides neighbor algorithms for the new query and exploration visualizations.
 */
class Similarity2Service {

    def interestService
    def databaseService
    def similarityService
    def semanticSimilarityService
    def wikAPIdiaService

    public ClusterMap buildPersonMap(Long personId) {
        ClusterMapBuilder b = new ClusterMapBuilder(wikAPIdiaService.interests, wikAPIdiaService.users)
        TIntList interestIds = new TIntArrayList(Person.get(personId).interests*.id as int[])
        return b.getPersonClusterMap(personId, interestIds)
    }

    public ClusterMap buildInterestMap(Long interestId) {
        ClusterMapBuilder b = new ClusterMapBuilder(wikAPIdiaService.interests, wikAPIdiaService.users)
        return b.getInterestClusterMap(interestId)
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
        MacademiaGraph graph = new MacademiaGraph(NodeType.PERSON, rootId);

        ClusterMapBuilder cmb = new ClusterMapBuilder(wikAPIdiaService.interests, wikAPIdiaService.users)
        TIntList interestIds = new TIntArrayList(Person.get(rootId).interests*.id as int[])
        graph.setClusterMap(cmb.getPersonClusterMap(rootId, interestIds))
        ANALYSIS.recordTime("clustermap")

        // TODO: refine results


//        PersonGraph graph = new PersonGraph(rootId, interestWeights)
        ANALYSIS.recordTime("getPerson")
        Person root = Person.get(rootId)
        if (root == null) {
            log.warn("Uknown person: $rootId")
            return null
        }
        ANALYSIS.recordTime("getPerson")

        ANALYSIS.recordTime("getNeighbors")

        ClusterMapBuilder crf = new ClusterMapBuilder(wikAPIdiaService.interests, wikAPIdiaService.users)
        Map<Integer, TIntList> clusterMap = crf.getClusterMap(new TIntArrayList(root.interests*.id as int[]))
        ANALYSIS.recordTime("clusterMap")


        TIntSet clusterMemberIds = new TIntHashSet()

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
