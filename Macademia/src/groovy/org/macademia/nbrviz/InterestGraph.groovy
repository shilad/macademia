package org.macademia.nbrviz

import org.macademia.graph.InterestInfo
import org.macademia.SimilarInterestList
import org.macademia.SimilarInterest
import org.macademia.Interest
import org.macademia.graph.InterestRole.RoleType

/**
 * Usage:
 * - Create graph
 * - Add similar interest list for all interests related to root
 * - chooseClusterRoots()
 * - fillClusters()
 */
class InterestGraph extends NbrvizGraph {

    Long rootId = null

    public InterestGraph(Long rootId, Map<Long, Double> interestWeights) {
        this.rootId = rootId
        this.interestWeights = interestWeights
    }

    @Override
    public void chooseClusterRoots(int maxRoots) {
        Set<Long> chosen = new HashSet<Long>([rootId])
        Set<Long> candidates = new HashSet<Long>(getTopIds(interestSims[rootId], 1000))
        while (candidates.size() > 0 && chosen.size() < maxRoots) {
            Long clusterRoot = pickRepresentativeInterest(rootId, candidates, chosen, 1.0)
            chosen.add(clusterRoot)
            candidates.remove(clusterRoot)
        }


        // assign interests to appropriate cluster
        clusterMap.clear()
        for (Long parentId: chosen) {
            clusterMap[parentId] = new HashSet<Long>()
            Set<Long> cluster = new HashSet<Long>()
            cluster.addAll(clusterMap[parentId])
            cluster.add(parentId)
            for (Long childId : cluster) {
                SimilarInterestList sil = interestSims.get(childId)
                int i = 0;
                for (SimilarInterest si : sil) {
                    if (i++ > SIMILAR_USER_INTEREST_NEIGHBORHOOD|| si.similarity < MIN_SIMILARITY_THRESHOLD)
                        break;
                    Long iid = si.interestId
                    InterestInfo ii = interestInfo.get(iid, new InterestInfo(interestId : iid))
                    // install surrogate similarity
                    ii.addRole(RoleType.HIDDEN, parentId, si.similarity)
                }
            }
        }
    }

    @Override
    public void prettyPrint() {
        def f = { "$it:" + Interest.get(it)?.text } // nice to string
        println("Interests clusters are:")
        Map<Long, Set<Long>> cmap = getClusterMap()
        for (Long qid : cmap.keySet()) {
            def s = "\t${f(qid)} >> "
            for (Long cid : cmap[qid]) {
                s += (" ${f(cid)},")
            }
            println(s)
        }

        for (Long pid: personClusterEdges.keySet()) {
            println("person with similarity" + personScores[pid] + ":")
            for (PersonClusterEdge edge : personClusterEdges[pid]) {
                def s = ("\t" + edge.relevance + ", " + f(edge.clusterId) + ">> ")
                for (Long id : edge.relevantInterestIds) {
                    s += (f(id) + ", ")
                }
                println(s)
            }
        }
    }
}
