package org.macademia.nbrviz

import org.macademia.SimilarInterestList
import org.macademia.SimilarInterest
import org.macademia.Interest

class QueryGraph {
    static class InterestInfo {
        long interestId = 0
        long queryInterestId = -1
        double queryRelevance = -1.0
        boolean isSubInterest = false
    }

    public static final double CLUSTER_PENALTY = 0.5
    public static final double HIGH_RELEVANCE = 0.6

    Set<Long> queryIds
    Map<Long, Double> queryWeights = [:]
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]

    public QueryGraph(Set<Long> queryIds) {
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
     * @param relatedInterestId
     * @param sil
     */
    public void addQueryRelatedInterests(Long queryInterestId, Long relatedInterestId) {
        if (!interestInfo.containsKey(relatedInterestId)) {
            interestInfo[relatedInterestId] = new InterestInfo(
                        interestId : relatedInterestId,
                        queryInterestId : queryInterestId,
                        queryRelevance : HIGH_RELEVANCE,
                    )
        }
        interestInfo[relatedInterestId].queryInterestId = queryInterestId
        interestInfo[relatedInterestId].isSubInterest = true
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
        iids.addAll(
                interestInfo.values().findAll({it.isSubInterest})
                                     .collect({it.interestId})
        )
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

    public Map<Long, Integer> getInterestCounts() {
        Map<Long, Integer> counts = [:]
        for (PersonClusterEdge e : personClusterEdges.values().flatten()) {
            e.relevantInterestIds.each({counts[it] = counts.get(it, 0) + 1})
        }
        return counts
    }

    public Map<Long, Set<Long>> getClusterMap() {
        Map<Long, Set<Long>> cmap = [:]
        for (InterestInfo ii : interestInfo.values()) {
            if (ii.queryInterestId < 0) {
                continue
            }
            if (!cmap.containsKey(ii.queryInterestId)) {
                cmap[ii.queryInterestId] = new HashSet<Long>()
            }
            if (ii.interestId != ii.queryInterestId) {
                cmap[ii.queryInterestId].add(ii.interestId)
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

        Map<Long, Set<Long>> cmap = getClusterMap()
        for (Long qid : cmap.keySet()) {
            println("Subinterests for ${f(qid)}:")
            for (Long cid : cmap[qid]) {
                println("\t${f(cid)}")
            }
        }
    }
}

