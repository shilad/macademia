package org.macademia.nbrviz

import org.macademia.SimilarInterestList
import org.macademia.SimilarInterest
import org.macademia.Interest
import org.macademia.nbrviz.InterestRole.RoleType

/**
 * TODO: reconcile QueryGraph, InterestGraph, PersonGraph
 */
class InterestGraph {
    public static final double CLUSTER_PENALTY = 0.5

    Long rootId = null
    Set<Long> relatedInterestIds = new HashSet()
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]
    Map<Long, Double> interestWeights = [:]

    public InterestGraph(Long interestId) {
        this.rootId = interestId
        interestWeights[rootId] = 1.0
        interestInfo[rootId] = new InterestInfo(interestId : rootId)
        interestInfo[rootId].addRole(RoleType.ROOT, rootId, 1.0)
    }

    // Should also be called for the root id
    public void addRelatedInterest(Long interestId, double weight, Set<Long> displayedIds, SimilarInterestList sil) {

        // setup related interest cluster node
        if (interestId != rootId) {
            relatedInterestIds.add(interestId)
            if (!interestInfo.containsKey(interestId)) {
                interestInfo[interestId] = new InterestInfo(interestId : interestId)
            }
            InterestInfo ii = interestInfo[interestId]
            ii.addRole(RoleType.RELATED_ROOT, interestId, weight)
            interestWeights[interestId] = weight
        }

        // Update to handle interestId = rootId...
        println("for $interestId should display $displayedIds")
        for (SimilarInterest si : sil.list) {
            Long iid = si.interestId
            boolean isDisplayed = displayedIds.contains(iid)
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            InterestInfo ii = interestInfo[iid]
            RoleType role = RoleType.HIDDEN;
            if (isDisplayed) {
                role = (interestId == rootId) ? RoleType.CHILD_OF_ROOT : RoleType.CHILD_OF_RELATED
            }
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
        Set<Long> iids = new HashSet<Long>(relatedInterestIds)
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
            sim += e.relevance * interestWeights[e.clusterId] * interestWeights[e.clusterId]
        }
        return sim
    }

    public Map<Long, Set<Long>> getClusterMap() {
        Map<Long, Set<Long>> cmap = [:]
        cmap[rootId] = new HashSet()
        relatedInterestIds.each({ cmap[it] = new HashSet() })

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
        print(" " + f(rootId) + " (root)")
        for (Long rid : relatedInterestIds) {
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


    Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

}
