package org.macademia.nbrviz

import org.macademia.SimilarInterestList

/**
 * Created by IntelliJ IDEA.
 * User: shilad
 * Date: 3/6/12
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class NbrvizGraph {
    public static final double CLUSTER_PENALTY = 0.5

    public static final double MIN_SIMILARITY_THRESHOLD = 0.6

    /**
     * Size of neighborhood around root for
     */
    public static final int CLUSTER_ROOT_NEIGHBORHOOD = 200


    public static final int SIMILAR_USER_INTEREST_NEIGHBORHOOD = 200


    Map<Long, Set<Long>> clusterMap = [:]
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]
    Map<Long, Double> interestWeights = [:]
    Map<Long, SimilarInterestList> interestSims = [:]


    public void addSimilarInterests(Long interestId, SimilarInterestList sil) {
        InterestInfo ii = interestInfo.get(interestId, new InterestInfo(interestId : interestId))
        ii.addRole(InterestRole.RoleType.HIDDEN, interestId, 0.0)
        interestSims[interestId] = sil
    }

    /**
     * Child classes must define these methods:
     */
    public abstract void chooseClusterRoots(int maxRoots);
    public abstract void prettyPrint();

    public void fillClusters() {
        for (Long id : clusterMap.keySet()) {
            pickClusterMembers(id)
        }
    }

    public Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

    public boolean hasPerson(Long pid) {
        return personScores.containsKey(pid)
    }


    public Set<Long> getInterestsNeedingSims() {
        Set<Long> needed = new HashSet<Long>(clusterMap.keySet())
        for (Long root : clusterMap.keySet()) {
            needed.addAll(getTopIds(interestSims[root], CLUSTER_ROOT_NEIGHBORHOOD))
        }
        return needed
    }

    public Set<Long> getInterestsToFindUsers() {
        Set<Long> arena = new HashSet<Long>()
        arena.addAll(clusterMap.keySet())
        for (Long rootId : clusterMap.keySet()) {
            arena.addAll(getTopIds(interestSims[rootId], SIMILAR_USER_INTEREST_NEIGHBORHOOD))
        }

        // filter to close arena
        Set<Long> closeArena = new HashSet<Long>()
        for (Long id : arena) {
            if (interestInfo.containsKey(id) && interestInfo[id].closestRelevance > MIN_SIMILARITY_THRESHOLD) {
                closeArena.add(id)
            }
        }
        return closeArena
    }

    /**
     * Pick members of cluster
     */
    public Set<Long> pickClusterMembers(Long root) {
        Set<Long> candidates = new HashSet<Long>()

        // add candidates closest to the root cluster
        for (Long id : getTopIds(interestSims[root], CLUSTER_ROOT_NEIGHBORHOOD)) {
            InterestInfo ii = interestInfo[id]
//            println("closest for $id is ${ii.closestParentId}")
            if (id != root && ii.closestParentId == root) {
                candidates.add(id)
            }
        }
        
        // chose candidates
        Set<Long> chosen = new HashSet<Long>()
        while (candidates.size() > 0 && chosen.size() < 7) {
            Long id = pickRepresentativeInterest(root, candidates, chosen, 2.0)
            if (id == null) break
            chosen.add(id)
            candidates.remove(id)
        }

        // record role
        for (Long id : chosen) {
            interestInfo[id].addRole(InterestRole.RoleType.CHILD_OF_RELATED, root, interestSims[root].getSimilarityOfId(id))
        }
        clusterMap[root] = chosen

        return chosen
    }

    protected Long pickRepresentativeInterest(Long root, Set<Long> candidates, Set<Long> chosen, double simExp) {
        Set<Long> currentTop = new HashSet<Long>()

        // Add top chosen and root interests
        currentTop.addAll(getTopIds(interestSims[root], 15))
        for (Long id : chosen) {
            currentTop.addAll(getTopIds(interestSims[id], 30))
        }
        candidates.removeAll(chosen)
        candidates.remove(root)

        // choose the best one!
        Long bestId = null
        double bestScore = 0.0
        for (Long id : candidates) {
            if (!interestSims.containsKey(id)) {
                continue
            }
            SimilarInterestList sil = interestSims[id]
            Set<Long> candidateTop = getTopIds(sil, 15)
            candidateTop.removeAll(currentTop)
            int numNew = candidateTop.size()
            double sim = interestSims[root].getSimilarityOfId(id)

//            double score = Math.pow(sim, simExp) * Math.pow(numNew, 1.0) * Math.pow(Math.log(sil.count + 1), 1.0)
            double score = Math.pow(sim, simExp) * numNew * Math.log(sil.count + 1)
            if (score > bestScore) {
                bestScore = score
                bestId = id
            }
        }

        return bestId
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
