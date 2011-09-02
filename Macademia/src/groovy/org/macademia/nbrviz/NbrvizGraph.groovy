package org.macademia.nbrviz

import org.macademia.Graph
import org.macademia.IdAndScore
import org.macademia.Edge

class NbrvizGraph extends Graph {
    Map<Long, Map<Long, Double>> otherInterestSims = [:]
    Map<Long, Map<Long, Double>> personClusterRelevances = [:]
    Map<Long, Map<Long, Integer>> personClusterCounts = [:]
    Map<Long, Double> finalPersonScores = [:]


    public NbrvizGraph(Long rootPersonId) {
        this.clusterPenalty = 0.7
        this.rootPersonId = rootPersonId
        edges = 0
    }

    public NbrvizGraph() {
        this(null)
    }

    public void finalizeGraph(int maxPeople) {
        int numClusters = interestClusters.values().max() + 1

        List<IdAndScore> finalPersonSims = []
        for (Long pid: personScores.keySet()) {
            double sim = scorePersonSimilarity(pid, numClusters)
            finalPersonSims.add(new IdAndScore(pid, sim))
        }
        Collections.sort(finalPersonSims)

        if (finalPersonSims.size() > maxPeople) {
            finalPersonSims = finalPersonSims[0..maxPeople]
        }
        personMap.clear()
        for (IdAndScore personAndSim: finalPersonSims) {
            finalPersonScores[personAndSim.id] = personAndSim.score
            personMap.put(
                    personAndSim.id as long,
                    potentialPersonEdges.get(personAndSim.id) )
        }
    }

    public void addOtherInterestSim(Long i1, Long i2, double sim) {
        if (!otherInterestSims.containsKey(i1)) {
            otherInterestSims[i1] = [:]
        }
        if (!otherInterestSims.containsKey(i2)) {
            otherInterestSims[i2] = [:]
        }
        otherInterestSims[i1][i2] = sim
        otherInterestSims[i2][i1] = sim
    }


    public void clusterQueryInterests(Set<Long> queryIds) {
        interestClusters.clear()
        int c = 0
        for (Long id1 : queryIds) {
            interestClusters[id1] = c++
        }
        for (Long id1 : otherInterestSims.keySet()) {
            if (queryIds.contains(id1)) {
                continue
            }
            double maxSim = -1.0
            Long closestId = null
            for (Long id2 : otherInterestSims[id1].keySet()) {
                def s = otherInterestSims[id1][id2]
                if (s > maxSim) {
                    maxSim = s
                    closestId = id2
                }
            }
            if (closestId != null) {
                interestClusters[id1] = interestClusters[closestId]
            }
        }
        c++
    }

    /**
     * Returns the overall similarity score for a particular person.
     * @param pid
     * @param clusterCoefficient
     * @param maxSim
     * @return
     */
    protected double scorePersonSimilarity(long pid, int numClusters) {
        double sim = 0.0
        Set<Long> used = new HashSet<Long>()
        double[] clusterCoefficient = new double[numClusters];
        Collections.sort(personScores[pid])
        Arrays.fill(clusterCoefficient, 1.0)
        def clusterScores = [:]
        def clusterCounts = [:]
        for (IdAndScore interestAndSim: personScores[pid]) {
            if (used.contains(interestAndSim.id2)) {
                continue
            }
            used.add(interestAndSim.id2)
            int c = interestClusters[interestAndSim.id2]
            double s = interestAndSim.score
            s *= clusterCoefficient[c]
            clusterScores[interestAndSim.id] = clusterScores.get(interestAndSim.id, 0.0) + s
            clusterCounts[interestAndSim.id] = clusterCounts.get(interestAndSim.id, 0) + 1
            sim += s
            clusterCoefficient[c] *= clusterPenalty
        }
        personClusterRelevances[pid] = clusterScores
        personClusterCounts[pid] = clusterCounts

        return sim
    }

}

