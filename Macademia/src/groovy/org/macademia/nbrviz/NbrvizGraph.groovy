package org.macademia.nbrviz

import org.macademia.Graph
import org.macademia.IdAndScore
import org.macademia.Edge

class NbrvizGraph extends Graph {

    Map<Long, Map<Long, Double>> otherInterestSims = [:]


    public NbrvizGraph(Long rootPersonId) {
        this.rootPersonId = rootPersonId
        edges = 0
    }

    public NbrvizGraph() {
        this(null)
    }

    //maxPeople does nothing, just there for compatability
    public void finalizeGraph(int maxPeople) {
        clusterRootInterests()
        def interestCounts = [:]
        for (Set<Edge> edges: potentialPersonEdges.values()) {
            for (Edge e: edges) {
                Long i = (e.relatedInterestId != null) ? e.relatedInterestId : e.interestId
                if (!interestCounts.containsKey(i)) {
                    interestCounts[i] = 0
                }
                interestCounts[i]++
            }
        }
        List<Double> allSims = []
        int numClusters = ensureAllInterestsAreClustered(allSims)
        allSims = allSims.findAll { it < 1.0 }
        Collections.sort(allSims)
        double maxSim = allSims[(int) ((allSims.size() - 1) * 0.95)]
        maxSim = (maxSim == null) ? 1.0 : maxSim
        List<IdAndScore> finalPersonSims = []
        if (rootPersonId != null) {
            finalPersonSims.add(new IdAndScore(rootPersonId, Double.MAX_VALUE))
        }
        for (Long pid: personScores.keySet()) {
            double sim = scorePersonSimilarity(pid, numClusters, maxSim, interestCounts)
            finalPersonSims.add(new IdAndScore(pid, sim))
        }
        Collections.sort(finalPersonSims)

        // Shilad: I added this back in.  Not sure why it was taken out.
        if (finalPersonSims.size() > maxPeople) {
            finalPersonSims = finalPersonSims[0..maxPeople]
        }
        personMap.clear()
        for (IdAndScore personAndSim: finalPersonSims) {
            personMap.put(personAndSim.id as long, potentialPersonEdges.get(personAndSim.id))
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

    public double clusterSimilarity(Collection<Long> cluster1, Collection<Long> cluster2) {
        if (cluster1.size() == 0 || cluster2.size() == 0) {
            return 0.0
        }
        double sim = 0.0
        for (Long i1: cluster1) {
            for (Long i2: cluster2) {
                if (intraInterestSims.containsKey(i1) && intraInterestSims[i1].containsKey(i2)) {
                    sim += intraInterestSims[i1][i2]
                } else if (otherInterestSims.containsKey(i1) && otherInterestSims[i1].containsKey(i2)) {
                    sim += otherInterestSims[i1][i2]
                }
            }
        }
        return sim / (cluster1.size() * cluster2.size())
    }

}

