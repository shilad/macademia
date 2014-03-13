package org.macademia.nbrviz

import org.macademia.graph.InterestInfo
import org.macademia.graph.InterestRole
import org.macademia.SimilarInterestList
import org.macademia.SimilarInterest
import org.macademia.Interest
import org.macademia.graph.InterestRole.RoleType

/**
 * TODO: reconcile QueryGraph, InterestGraph, PersonGraph
 */
class QueryGraph {

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

    // Should also be called for the root id
    public void addQueryInterest(Long interestId, double weight, Set<Long> displayedIds, SimilarInterestList sil) {

        queryIds.add(interestId)
        if (!interestInfo.containsKey(interestId)) {
            interestInfo[interestId] = new InterestInfo(interestId : interestId)
        }
        InterestInfo ii = interestInfo[interestId]
        ii.addRole(RoleType.RELATED_ROOT, interestId, weight)
        queryWeights[interestId] = weight

        for (SimilarInterest si : sil.list) {
            Long iid = si.interestId
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            ii = interestInfo[iid]
            RoleType role = displayedIds.contains(iid) ? RoleType.CHILD_OF_RELATED : RoleType.HIDDEN;
            ii.addRole(role, interestId, si.similarity)
        }
    }

    public void addPerson(Long pid, Collection<Long> interests) {
        Map<Long, PersonClusterEdge> edges = [:]
        for (Long iid : interests) {
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            Long cid = interestInfo[iid].closestParentId
            if (!edges.containsKey(cid)) {
                edges[cid] = new PersonClusterEdge(personId : pid, clusterId: cid)
            }
            edges[cid].relevantInterestIds.add(iid)
        }
        personClusterEdges[pid] = edges.values().asList()
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
                interestInfo.values().findAll({!it.roles.isEmpty()})
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
            e.relevantInterestIds.sort({ -1 * interestInfo[it].closestRelevance })
            double weight = 1.0
            e.relevance = 0.0
            for (Long iid : e.relevantInterestIds) {
                e.clusterId = interestInfo[iid].closestParentId
                e.relevance += interestInfo[iid].closestRelevance * weight
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
        queryIds.each({ cmap[it] = new HashSet() })

        for (InterestInfo ii : interestInfo.values()) {
            for (InterestRole ir : ii.roles) {
                if (ir.role == RoleType.HIDDEN || ir.parentId == ii.interestId) {
                    continue
                }
                cmap[ir.parentId].add(ii.interestId)
            }
        }
        return cmap
    }

    public void prettyPrint() {
        def f = { "$it:" + Interest.get(it)?.text } // nice to string
        print("Interests are:")
        for (Long rid : queryIds) {
            print(" " + f(rid) + ",")
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

