package org.macademia.nbrviz

import org.macademia.graph.InterestInfo
import org.macademia.graph.InterestRole
import org.macademia.SimilarInterestList

/**
 * A data structure that holds information about a result graph
 */
public abstract class NbrvizGraph {

    Map<Long, Set<Long>> clusterMap = [:]
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]
    Map<Long, Double> interestWeights = [:]

    public abstract void prettyPrint();

    public Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

    public boolean hasPerson(Long pid) {
        return personScores.containsKey(pid)
    }

    public void addClusterRoot(Long iid) {
        clusterMap[iid] = []
    }

    public void addClusterMember(Long clusterId, Long memberId, double relevance) {
        if (!clusterMap[clusterId].contains(memberId)) {
            clusterMap[clusterId].add(memberId)
        }
        interestInfo[clusterId].addRole(InterestRole.RoleType.CHILD_OF_RELATED, clusterId, relevance)
    }

    public void addInterest(Long iid, Long clusterId, double relevance) {
        if (!interestInfo.containsKey(iid)) {
            interestInfo[iid] = new InterestInfo(interestId : iid)
        }
        interestInfo[iid].addRole(InterestRole.RoleType.HIDDEN, clusterId, relevance)
    }

    public void addPerson(Long pid, Collection<Long> interests) {
        Map<Long, PersonClusterEdge> edges = [:]
        for (Long iid : interests) {
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            InterestInfo ii = interestInfo[iid]
            Long cid = ii.closestParentId
            if (ii.closestRelevance < MIN_SIMILARITY_THRESHOLD) {
                cid = -1
            }
            if (!edges.containsKey(cid)) {
                edges[cid] = new PersonClusterEdge(personId : pid, clusterId: cid)
            }
            edges[cid].relevantInterestIds.add(iid)
        }
        personClusterEdges[pid] = edges.values().asList()
    }

    public void finalizeGraph(int maxPeople) {
        Map<Long, double[]> personInterestDists = [:]
        for (Long pid : personClusterEdges.keySet()) {
            personScores[pid] = scorePersonSimilarity(pid)
            personInterestDists[pid] = getInterestDistribution(pid)
        }

        Set<Long> chosen = new HashSet<Long>()
        Set<Long> candidates = new HashSet<Long>(personScores.keySet())

        // Chosen the top people
        while (candidates.size() > 0 && chosen.size() < maxPeople) {
            Long bestUser = null
            double bestScore = Double.NEGATIVE_INFINITY

            for (Long pid : candidates) {

                // calculate the top 2 similarities to existing candidates
                double [] dist1 = personInterestDists[pid]
                double [] distDots = new double[chosen.size()]
                int i = 0
                for (Long pid2 : chosen) {
                    double [] dist2 = personInterestDists[pid2]
                    assert(dist1.length == dist2.length)
                    distDots[i] = 0.0
                    for (int j = 0; j < dist1.length; j++) {
                        distDots[i] += dist1[j] * dist2[j]
                    }
                    i++
                }
                assert(i == chosen.size())
                Arrays.sort(distDots)
                double sim = 0.0
                for (i = Math.max(0, distDots.length - 3); i < distDots.length; i++) {
                    sim += distDots[i]
                }

                double score = personScores[pid] - sim
                if (score > bestScore) {
                    bestScore = score
                    bestUser = pid
                }

                if (bestUser == null) {
                    break
                }
            }
            chosen.add(bestUser)
            candidates.remove(bestUser)
        }

        // prune people
        personScores.keySet().retainAll(chosen)
        personClusterEdges.keySet().retainAll(chosen)

        // prune interests associated with those people and subcluster ids
        Set<Long> iids = new HashSet<Long>()
        for (Set<PersonClusterEdge> pedges : personClusterEdges.values()) {
            pedges.each({iids.addAll(it.relevantInterestIds)})
        }
        iids.addAll(
                interestInfo.values().findAll({!it.roles.isEmpty()})
                        .collect({it.interestId})
        )
        interestInfo.keySet().retainAll(iids)
    }

    protected double[] getInterestDistribution(long pid) {
        List<Long> roots = clusterMap.keySet().asList()
        roots.sort()
        double [] dist = new double [roots.size()]
        for (PersonClusterEdge e : personClusterEdges.get(pid)) {
            if (e.clusterId < 0) {
                continue    // unrelated interests
            }
            int i = roots.indexOf(e.clusterId)
            if (i < 0) throw new IllegalStateException("cluster ${e.clusterId} not found")
            dist[i] += 1
        }

        double norm = 0.0
        for (double x : dist) norm += x*x
        if (norm == 0) {
            return dist
        }
        norm = Math.sqrt(norm)
        for (int i = 0; i < dist.length; i++) {
            dist[i] /= norm
        }
        return dist
    }


    /**
     * Returns the overall similarity score for a particular person.
     * @param pid
     * @return
     */
    protected double scorePersonSimilarity(long pid) {
        double sim = 0.0
        for (PersonClusterEdge e : personClusterEdges.get(pid)) {
            if (e.clusterId < 0) {
                continue    // unrelated interests
            }
            e.relevantInterestIds.sort({ -1 * interestInfo[it].closestRelevance })
            double weight = 1.0
            e.relevance = 0.0
            for (Long iid : e.relevantInterestIds) {
                e.clusterId = interestInfo[iid].closestParentId
                e.relevance += interestInfo[iid].closestRelevance * weight
                weight *= CLUSTER_PENALTY
            }
            sim += e.relevance * interestWeights.get(e.clusterId, 0.5)
        }
        return sim
    }

    protected Collection<Long> getTopIds(SimilarInterestList sil, int n) {
        Set<Long> topIds = new HashSet<Long>()
        for (int i = 0; i < Math.min(n, sil.size()); i++) {
            topIds.add(sil.get(i).interestId)
        }
        return topIds
    }
}
