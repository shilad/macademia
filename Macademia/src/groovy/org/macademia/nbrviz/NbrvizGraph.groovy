package org.macademia.nbrviz

import org.macademia.Graph
import org.macademia.IdAndScore
import org.macademia.Edge

class NbrvizGraph extends Graph {

  public NbrvizGraph(Long rootPersonId) {
    this.rootPersonId = rootPersonId
    edges = 0
  }

  public NbrvizGraph() {
    this(null)
  }

  //maxPeople does nothing, just there for compatability
  public void finalizeGraph(int maxPeople){
    clusterRootInterests()
    def interestCounts = [:]
    for (Set<Edge> edges : potentialPersonEdges.values()) {
      for (Edge e : edges) {
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
    double maxSim = allSims[(int)((allSims.size() - 1) * 0.95)]
    maxSim = (maxSim == null) ? 1.0 : maxSim
    List<IdAndScore> finalPersonSims = []
    if (rootPersonId != null) {
      finalPersonSims.add(new IdAndScore(rootPersonId, Double.MAX_VALUE))
    }
    for (Long pid : personScores.keySet()) {
      double sim = scorePersonSimilarity(pid, numClusters, maxSim, interestCounts)
      finalPersonSims.add(new IdAndScore(pid, sim))
    }
    Collections.sort(finalPersonSims)
    personMap.clear()
    for (IdAndScore personAndSim : finalPersonSims) {
      personMap.put(personAndSim.id, potentialPersonEdges.get(personAndSim.id))
    }
  }
}

