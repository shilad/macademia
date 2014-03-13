package org.macademia.nbrviz

import org.macademia.Interest
import org.macademia.graph.InterestInfo
import org.macademia.SimilarInterest
import org.macademia.SimilarInterestList
import org.macademia.graph.InterestRole.RoleType
import gnu.trove.set.TIntSet
import gnu.trove.set.hash.TIntHashSet

/**
 * Procedure:
 * - Create a person graph.
 * - Add root person interests.
 * - choose cluster roots (also clusters person's interests).
 * - addSimilarInterests for all interests in getInterestsNeedingSims
 * - chooseClusterMembers
 * -
 */
class PersonGraph extends NbrvizGraph {

    Long rootId = null
    Map<Long, Set<Long>> rootPersonClusters = null
    float [][] cosims
    long[] cosimInterestIds

    public PersonGraph(Long personId, Map<Long, Double> interestWeights) {
        this.rootId = personId
        this.interestWeights = interestWeights
    }

    public void addRootPersonInterests(int [] interestIds, float [][] cosims) {
        this.cosims = cosims
        this.cosimInterestIds = interestIds as long[]
    }

    public void addRootPersonInterestSimilarities(Long interestId, SimilarInterestList sil) {
        InterestInfo ii = interestInfo.get(interestId, new InterestInfo(interestId : interestId))
        ii.addRole(RoleType.CHILD_OF_ROOT, interestId, 0.0)
        interestSims[interestId] = sil
    }

    /**
     * Chooses roots for each cluster and updates internal data structure with necessary info.
     */
    public void chooseClusterRoots(int maxRoots) {

        // note that ids below are dense indexes into [0... cosimInterestIds.length-1]
        // we need to look up actual interest ids in cosimInterestIds.
        List<TIntSet> clusters = formClusters(maxRoots)
        Map<Integer, TIntSet> clusterReps = pickClusterReps(clusters)

        // create root edges with real ids (not dense)
        Map<Long, PersonClusterEdge> rootEdges = reclusterAroundReps(clusterReps)

        // build up clusters with actual ids
        rootPersonClusters = [:]
        for (int i : clusterReps.keySet()) {
            Set<Long> c = [] as Set<Long>
            for (int j : clusterReps.get(i).toArray()) {
                c.add(cosimInterestIds[j])
            }
            rootPersonClusters[cosimInterestIds[i]] = c
        }
        personClusterEdges[rootId] = rootEdges.values()

        // Fill in interest info
        for (Long id1: rootPersonClusters.keySet()) {
            clusterMap[id1] = new HashSet<Long>()
            InterestInfo ii1 = interestInfo.get(id1, new InterestInfo(interestId : id1))
            ii1.addRole(RoleType.RELATED_ROOT, id1, 1.0)
        }

        // create surrogate mapping between user's interests in cluster and root of cluster
        for (Long parentId: rootPersonClusters.keySet()) {
            for (Long childId : rootPersonClusters[parentId]) {
                SimilarInterestList sil = interestSims.get(childId)
                for (SimilarInterest si : sil) {
                    Long iid = si.interestId
                    InterestInfo ii = interestInfo.get(iid, new InterestInfo(interestId : iid))
                    // install surrogate similarity
                    ii.addRole(RoleType.HIDDEN, parentId, si.similarity)
                }
            }
        }
    }

    private Map<Long, PersonClusterEdge> reclusterAroundReps(Map<Integer, TIntSet> clusterReps) {
        Map<Long, PersonClusterEdge> rootEdges = [:]
        for (int i : 0..cosimInterestIds.length - 1) {
            int iid = cosimInterestIds[i]
            double bestSim = 0.0
            int bestRoot = -1
            for (int j : clusterReps.keySet()) {
                double sim = cosims[i][j]
                if (sim > bestSim) {
                    bestSim = sim
                    bestRoot = j
                }
            }
            long bestRootId = (bestRoot) < 0 ? -1 : cosimInterestIds[bestRoot]
            if (!rootEdges.containsKey(bestRootId)) {
                rootEdges[bestRootId] = new PersonClusterEdge(personId: rootId, clusterId: bestRootId)
            }
            rootEdges[bestRootId].relevantInterestIds.add(iid)
            if (bestRoot >= 0) {
                clusterReps[bestRoot].add(i)
            }
        }
        return rootEdges
    }

    private Map<Integer, TIntSet> pickClusterReps(List<TIntSet> clusters) {
        Map<Long, Integer> counts = [:]
        for (int i : 0..cosimInterestIds.length - 1) {
            int id = cosimInterestIds[i]
            counts[i] = interestSims[id as long].count
        }

        // pick representative interests for each cluster
        Map<Integer, TIntSet> clusterReps = [:]
        for (TIntSet c : clusters) {
            double bestScore = 0.0
            Integer best = null
            for (int id1 : c.toArray()) {
                double score = 0.00001
                for (int id2 : c.toArray()) {
                    if (id1 != id2) {
                        score += cosims[id1][id2]
                    }
                }
                score *= Math.log(counts[id1] + 2)
                if (score > bestScore) {
                    bestScore = score
                    best = id1
                }
            }
            if (best == null) { throw new IllegalStateException() }
            clusterReps[best] = new HashSet<Long>()
        }
        return clusterReps
    }

    private List<TIntSet> formClusters(int maxRoots) {
        List<TIntSet> clusters = []
        for (int i : 0..cosimInterestIds.length - 1) {
            clusters.add(new TIntHashSet([i]))
        }

        def int_name = { int i ->
            Interest.get(cosimInterestIds[i]).text
        }
        def cluster_desc = { TIntSet c ->
            return c.toArray().collect({int_name(it)}).join(", ")
        }

        // merge clusters
        while (true) {
            List<TIntSet> closestPair = null
            double closestSim = 0.0

            for (TIntSet c1 : clusters) {
                for (TIntSet c2 : clusters) {
                    if (c1 == c2) {
                        continue
                    }

                    double sim = 0.0
                    for (int id1 : c1.toArray()) {
                        for (int id2 : c2.toArray()) {
                            sim += cosims[id1][id2]
//                            println("cosims for ${int_name(id1)} ${int_name(id2)} are ${cosims[id1][id2]}")
                        }
                    }

//                    double size_penalty = 1 + Math.log(1 + 0.15 * Math.log(c1.size() * c2.size()))
                    double size_penalty = 1.0
                    sim /= (c1.size() * c2.size() * size_penalty)
//                    System.out.println("considering ${cluster_desc(c1)} and ${cluster_desc(c2)} with sim $sim")

                    if (sim > closestSim) {
                        closestSim = sim
                        closestPair = [c1, c2]
                    }
                }
            }

            TIntSet c1 = closestPair[0]
            TIntSet c2 = closestPair[1]
            println("joining ${cluster_desc(c1)} and ${cluster_desc(c2)} with sim $closestSim")

            // Not close enough, Period!
            if (closestSim < 0.70) { break }

            // We hit our goal, and want to retain detailed structure.
            if (clusters.size() <= maxRoots && closestSim < 0.85) { break }

            clusters.remove(c1)
            c2.addAll(c1)
        }

        // truncate to maxRoots  clusters
        if (clusters.size() > maxRoots) {
            Collections.shuffle(clusters)
            clusters.sort({ -1 * it.size() })
            clusters = clusters.subList(0, maxRoots)
        }
        return clusters
    }

    @Override
    public void finalizeGraph(int maxPeople) {
        double score = scorePersonSimilarity(rootId)
        Collection<PersonClusterEdge> edges = personClusterEdges[rootId]
        personClusterEdges.remove(rootId)

        super.finalizeGraph(maxPeople)
        
        personScores[rootId] = score
        personClusterEdges[rootId] = edges
    }

    @Override
    public Set<Long> getInterestsNeedingSims() {
        Set<Long> needed = super.getInterestsNeedingSims()
        needed.addAll(getRootPersonInterests())
        return needed
    }

    @Override
    public Set<Long> getInterestsToFindUsers() {
        Set<Long> arena = super.getInterestsToFindUsers()
        for (Long id : getRootPersonInterests()) {
            if (interestInfo.containsKey(id) && interestInfo[id].closestRelevance > MIN_SIMILARITY_THRESHOLD) {
                arena.add(id)
            }
        }
        return arena
    }

    @Override
    public void prettyPrint() {
        def f = { "$it:" + Interest.get(it)?.text } // nice to string
        println("Interests clusters are:")
        Map<Long, Set<Long>> cmap = getClusterMap()
        for (Long qid : cmap.keySet()) {
            String s = "\t${f(qid)} >> "
            for (Long cid : cmap[qid]) {
                 s += " ${f(cid)},"
            }
             s+= "; (user has "
            for (Long cid : rootPersonClusters[qid]) {
                s += " ${f(cid)},"
            }
            println("$s)")
        }

        List<Long> pids = personClusterEdges.keySet() as List
        pids.sort(true, { pid1, pid2 -> -1 * personScores.get(pid1).compareTo(personScores.get(pid2))})
        for (Long pid: pids) {
            println("person with similarity" + personScores[pid] + ":")
            for (PersonClusterEdge edge : personClusterEdges[pid]) {
                String s = "\t" + edge.relevance + ", " + f(edge.clusterId) + ">> "
                for (Long id : edge.relevantInterestIds) {
                     s += f(id) + ", "
                }
                println(s)
            }
        }
    }

    public Set<Long> getRootPersonInterests() {
        Set<Long> interests = new HashSet<Long>()
        for (InterestInfo info : interestInfo.values()) {
            if (info.getRole(RoleType.CHILD_OF_ROOT)) {
                interests.add(info.interestId)
            }
        }
        return interests
    }
}
