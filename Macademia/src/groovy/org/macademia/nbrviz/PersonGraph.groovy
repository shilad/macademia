package org.macademia.nbrviz

import org.macademia.Interest
import org.macademia.SimilarInterest
import org.macademia.SimilarInterestList
import org.macademia.nbrviz.InterestRole.RoleType

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

    public PersonGraph(Long personId, Map<Long, Double> interestWeights) {
        this.rootId = personId
        this.interestWeights = interestWeights
    }

    public void addRootPersonInterest(Long interestId, SimilarInterestList sil) {
        InterestInfo ii = interestInfo.get(interestId, new InterestInfo(interestId : interestId))
        ii.addRole(RoleType.CHILD_OF_ROOT, interestId, 0.0)
        interestSims[interestId] = sil
    }

    public void chooseClusterRoots(int maxRoots) {
        Set<Long> personRootInterests = getRootPersonInterests()
        // generate correlation matrix
        Map<String, Double> correlationMatrix = makeCorrelationMatrix(personRootInterests)

        // create a cluster for each id
        List<Set<Long>> clusters = []
        for (Long id : personRootInterests) {
            clusters.add(new HashSet<Long>([id]))
        }

        // merge clusters
        while (true) {
            List<Set<Long>> closestPair = null
            double closestSim = 0.0

            for (Set<Long> c1 : clusters) {
                for (Set<Long> c2 : clusters) {
                    if (c1 == c2) {
                        continue
                    }

                    double sim = 0.0
                    for (Long id1 : c1) {
                        for (Long id2 : c2) {
                            sim += correlationMatrix.get(id1+","+id2, 0.0)
                        }
                    }

                    double size_penalty = Math.log(c1.size() * c2.size() + 1) / (2 * Math.log(2))
                    sim /= (c1.size() * c2.size() * size_penalty)
                    if (sim > closestSim) {
                        closestSim = sim
                        closestPair = [c1, c2]
                    }
                }
            }

            Set<Long> c1 = closestPair[0]
            Set<Long> c2 = closestPair[1]

            // Not close enough, Period!
            if (closestSim < MIN_SIMILARITY_THRESHOLD) { break }

            // We hit our goal, and want to retain detailed structure.
            if (clusters.size() <= maxRoots && closestSim < 0.1) { break }

            // Both clusters are bigger than 1, and the sim isn't particularly close
            if (clusters.size() > maxRoots  && c1.size() > 1 && c2.size() > 1 && closestSim < 0.05) { break }

            clusters.remove(c1)
            c2.addAll(c1)
        }

        // truncate to maxRoots  clusters
        if (clusters.size() > maxRoots ) {
            Collections.shuffle(clusters)
            clusters.sort({ -1 * it.size() })
            clusters = clusters.subList(0, maxRoots)
        }

        Map<Long, Integer> counts = [:]
        for (Long id : personRootInterests) {
            counts[id] = interestSims[id].count
        }

        // pick representative interests for each cluster
        Map<Long, Set<Long>> clusterReps = [:]
        for (Set<Long> c : clusters) {
            double bestScore = 0.0
            Long best = null
            for (Long id1 : c) {
                double score = 0.00001
                for (Long id2 : c) {
                    if (id1 != id2) {
                        score += correlationMatrix.get(id1+","+id2, 0.0)
                    }
                }
                score *= Math.log(counts[id1] + 1)
                if (score > bestScore) {
                    bestScore = score
                    best = id1
                }
            }
            if (best == null) { throw new IllegalStateException() }
            clusterReps[best] = new HashSet<Long>()
        }

        // recluster around those representatives and build up root edges
        Map<Long,PersonClusterEdge> rootEdges = [:]
        for (Long iid : personRootInterests) {
            double bestSim = 0.0
            Long bestRoot = -1
            for (Long rid : clusterReps.keySet()) {
                double sim = correlationMatrix.get(rid+","+iid, 0.0)
                if (sim > bestSim) {
                    bestSim = sim
                    bestRoot = rid
                }
            }
            if (!rootEdges.containsKey(bestRoot)) {
                rootEdges[bestRoot] = new PersonClusterEdge(personId: rootId, clusterId: bestRoot)
            }
            rootEdges[bestRoot].relevantInterestIds.add(iid)
            if (bestRoot >= 0) {
                clusterReps[bestRoot].add(iid)
            }
        }
        rootPersonClusters = clusterReps
        personClusterEdges[rootId] = rootEdges.values()

        // Fill in interest info
        for (Long id1: clusterReps.keySet()) {
            clusterMap[id1] = new HashSet<Long>()
            InterestInfo ii1 = interestInfo.get(id1, new InterestInfo(interestId : id1))
            ii1.addRole(RoleType.RELATED_ROOT, id1, 1.0)
        }

        // create surrogate mapping between user's interests in cluster and root of cluster
        for (Long parentId: clusterReps.keySet()) {
            for (Long childId : clusterReps[parentId]) {
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
            print("\t${f(qid)} >> ")
            for (Long cid : cmap[qid]) {
                print(" ${f(cid)},")
            }
            print("; (user has ")
            for (Long cid : rootPersonClusters[qid]) {
                print(" ${f(cid)},")
            }
            println(")")
        }

        for (Long pid: personClusterEdges.keySet()) {
            println("person with similarity" + personScores[pid] + ":")
            for (PersonClusterEdge edge : personClusterEdges[pid]) {
                print("\t" + edge.relevance + ", " + f(edge.clusterId) + ">> ")
                for (Long id : edge.relevantInterestIds) {
                    print(f(id) + ", ")
                }
                println("")
            }
        }
    }

    /**
     * Keys in result are id1 + "," + id2
     * @param interestIds
     * @return
     */
    protected Map<String, Double> makeCorrelationMatrix(Set<Long> interestIds) {
        Map<String, Double> correlationMatrix = [:]
        for (Long id1 : interestIds) {
            if (!interestSims.containsKey(id1)) {
                correlationMatrix[id1] = [:]
            }
            for (SimilarInterest si : interestSims.get(id1)) {
                Long id2 = si.interestId;
                if (interestIds.contains(id2)) {
                    correlationMatrix[id1+","+id2] = si.similarity
                    correlationMatrix[id2+","+id1] = si.similarity
                }
            }
        }
        return correlationMatrix
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
