package org.macademia.nbrviz

import org.macademia.SimilarInterestList
import org.macademia.SimilarInterest
import org.macademia.Interest

class QueryVizGraph {
    static class InterestInfo {
        long interestId = 0
        long queryInterestId = -1
        long clusterInterestId = -1
        double queryRelevance = -1.0
        double clusterRelevance = -1.0
        boolean isClusterId = false
    }

    public static final double CLUSTER_PENALTY = 0.5
    public static final double HIGH_RELEVANCE = 0.6

    Set<Long> queryIds
    Map<Long, Double> queryWeights = [:]
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]

    public QueryVizGraph(Set<Long> queryIds) {
        this.queryIds = queryIds
    }

    public Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

    /**
     * Must be called before addPerson
     * @param queryInterestId
     * @param sil
     */
    public void incorporateQuerySimilarities(Long queryInterestId, Double weight, SimilarInterestList sil) {
        queryWeights[queryInterestId] = weight
        for (SimilarInterest si : sil.list) {
            if (queryIds.contains(si.interestId)) {
                continue
            }
            InterestInfo iis = interestInfo[si.interestId]
            if (iis == null) {
                iis = new InterestInfo(interestId : si.interestId)
                interestInfo[si.interestId] = iis
            }
            if (si.similarity > iis.queryRelevance) {
                iis.queryInterestId = queryInterestId
                iis.queryRelevance = si.similarity
            }
        }
        interestInfo[queryInterestId] = new InterestInfo(
                    interestId : queryInterestId,
                    queryInterestId : queryInterestId,
                    isClusterId : true,
                    queryRelevance : HIGH_RELEVANCE,
                )
    }

    public void addPerson(Long pid, Collection<Long> interests) {
        Map<Long, PersonClusterEdge> edges = [:]
        for (Long iid : interests) {
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            Long cid = interestInfo[iid].queryInterestId
            if (!edges.containsKey(cid)) {
                edges[cid] = new PersonClusterEdge(personId : pid, clusterId: cid)
            }
            edges[cid].relevantInterestIds.add(iid)
        }
        personClusterEdges[pid] = edges.values().asList()
    }

    /**
     * Must be called after addPerson
     * @param queryInterestId
     * @param clusterInterestId
     * @param sil
     */
    public void addQuerySubCluster(Long queryInterestId, Long clusterInterestId, SimilarInterestList sil) {
        for (SimilarInterest si : sil.list) {
            InterestInfo ii = interestInfo[si.interestId]
            if (ii != null && !ii.isClusterId && ii.queryInterestId == queryInterestId && ii.clusterRelevance < si.similarity) {
                ii.clusterRelevance = si.similarity
                ii.clusterInterestId = clusterInterestId
            }
        }
        if (!interestInfo.containsKey(clusterInterestId)) {
            interestInfo[clusterInterestId] = new InterestInfo(
                        interestId : clusterInterestId,
                        queryInterestId : queryInterestId,
                        queryRelevance : HIGH_RELEVANCE,
                    )
        }
        interestInfo[clusterInterestId].clusterInterestId = clusterInterestId
        interestInfo[clusterInterestId].isClusterId = true
    }

    public void finalizeGraph(int maxPeople) {
        for (Long pid : personClusterEdges.keySet()) {
            personScores[pid] = scorePersonSimilarity(pid)
        }

        // Compute top people
        List<Long> pids = personScores.keySet().sort({ -1 * personScores[it]})
        List<Long> keepers = pids.size() <= maxPeople ? pids : pids.subList(0, maxPeople)

        // prune people
        personScores.keySet().retainAll(keepers)
        personClusterEdges.keySet().retainAll(keepers)

        // prune interests associated with those people and subcluster ids
        Set<Long> iids = new HashSet<Long>(queryIds)
        for (Set<PersonClusterEdge> pedges : personClusterEdges.values()) {
            pedges.each({iids.addAll(it.relevantInterestIds)})
        }
        interestInfo.values().each({iids.add(it.clusterInterestId)})
        interestInfo.keySet().retainAll(iids)
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
            e.relevantInterestIds.sort({ -1 * interestInfo[it].queryRelevance })
            double weight = 1.0
            e.relevance = 0.0
            for (Long iid : e.relevantInterestIds) {
                e.clusterId = interestInfo[iid].queryInterestId
                e.relevance += interestInfo[iid].queryRelevance * weight
                weight *= CLUSTER_PENALTY
            }
            sim += e.relevance * queryWeights[e.clusterId] * queryWeights[e.clusterId]
        }
        return sim
    }

    protected double [] computePersonProfile(long pid) {
        double [] profile = new double[queryIds.size()]
        double norm1 = 0.0
        for (PersonClusterEdge e : personClusterEdges[pid]) {
            int c = e.clusterId.toInteger()
            profile[c] = e.relevance
            norm1 += e.relevance
        }
        for (int i = 0; i < profile.length; i++) {
            profile[i] /= norm1
        }
        return profile
    }

    private static final dot(double [] X, double [] Y) {
        double sum = 0
        for (int i = 0; i < X.length; i++) {
            sum += X[i] * Y[i]
        }
        return sum
    }

    public Map<Long, Integer> getInterestCounts() {
        Map<Long, Integer> counts = [:]
        for (PersonClusterEdge e : personClusterEdges.values().flatten()) {
            e.relevantInterestIds.each({counts[it] = counts.get(it, 0) + 1})
        }
        return counts
    }

    public Map<Long, Map<Long, Set<Long>>> getClusterMap() {
        Map<Long, Map<Long, Set<Long>>> cmap = [:]
        for (InterestInfo ii : interestInfo.values()) {
            if (ii.queryInterestId < 0 || ii.clusterInterestId < 0) {
                continue
            }
            if (!cmap.containsKey(ii.queryInterestId)) {
                cmap[ii.queryInterestId] = [:]
            }
            if (!cmap[ii.queryInterestId].containsKey(ii.clusterInterestId)) {
                cmap[ii.queryInterestId][ii.clusterInterestId] = new HashSet<Long>()
            }
            if (ii.interestId != ii.queryInterestId && ii.interestId != ii.clusterInterestId) {
                cmap[ii.queryInterestId][ii.clusterInterestId].add(ii.interestId)
            }
        }
        return cmap
    }

    public void prettyPrint() {
        def f = { "$it:" + Interest.get(it)?.text } // nice to string
        print("Query is:")
        for (Long qid : queryIds) {
            print(" " + f(qid) + ",")
        }
        println()

        Map<Long, Map<Long, Set<Long>>> cmap = getClusterMap()
        for (Long qid : cmap.keySet()) {
            println("Clusters for ${f(qid)}:")
            for (Long cid : cmap[qid].keySet()) {
                println("\t${f(cid)}: ${cmap[qid][cid].collect(f).join(', ')}")
            }
        }
    }
}

