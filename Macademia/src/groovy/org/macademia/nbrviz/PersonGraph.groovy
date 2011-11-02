package org.macademia.nbrviz

import org.macademia.Interest
import org.macademia.SimilarInterest
import org.macademia.SimilarInterestList
import org.macademia.nbrviz.InterestRole.RoleType

/**
 * TODO: reconcile QueryGraph, InterestGraph, PersonGraph
 */
class PersonGraph {
    public static final double CLUSTER_PENALTY = 0.5

    Long rootId = null
    Set<Long> rootInterests = null
    Set<Long> relatedInterestIds = new HashSet()
    Map<Long, InterestInfo> interestInfo = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]
    Map<Long, Double> interestWeights = [:]

    public PersonGraph(Long personId, Set<Long> rootInterests) {
        this.rootId = personId
        this.rootInterests = rootInterests
    }

    // Should also be called for the root id
    public void addRelatedInterest(Long interestId, double weight, Set<Long> displayedIds, SimilarInterestList sil) {
        relatedInterestIds.add(interestId)
        InterestInfo ii = interestInfo.get(interestId, new InterestInfo(interestId : interestId))
        ii.addRole(RoleType.RELATED_ROOT, interestId, weight)
        interestInfo[interestId] = ii
        interestWeights[interestId] = weight

        for (SimilarInterest si : sil.list) {
            Long iid = si.interestId
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            ii = interestInfo[iid]
            ii.addRole(RoleType.HIDDEN, interestId, si.similarity)
        }

        for (Long iid : displayedIds) {
            if (!interestInfo.containsKey(iid)) {
                interestInfo[iid] = new InterestInfo(interestId : iid)
            }
            ii = interestInfo[iid]
            double sim = (ii.closestParentId == iid) ? ii.closestRelevance : 0.8
            ii.addRole(RoleType.CHILD_OF_RELATED, interestId, sim)
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
        relatedInterestIds.each({ cmap[it] = new HashSet() })

        for (InterestInfo ii : interestInfo.values()) {
            for (InterestRole ir : ii.roles) {
                if (ir.role == RoleType.HIDDEN || ir.role == RoleType.CHILD_OF_ROOT || ir.parentId == ii.interestId) {
                    continue
                }
                cmap[ir.parentId].add(ii.interestId)
            }
        }
        return cmap
    }

    public void prettyPrint() {
        def f = { "$it:" + Interest.get(it)?.text } // nice to string
        println("Interests clusters are:")
        Map<Long, Set<Long>> cmap = getClusterMap()
        for (Long qid : cmap.keySet()) {
            print("\t${f(qid)}:")
            for (Long cid : cmap[qid]) {
                print(" ${f(cid)};")
            }
            println("")
        }
    }


    Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

    boolean hasPerson(Long pid) {
        return personScores.containsKey(pid)
    }


    public String describeCluster(Set<Long> ids) {
        StringBuffer res = new StringBuffer("[")
        for (Long iid : ids) {
            Interest i = Interest.get(iid)
            String name = (i == null) ? ""+iid : "${i.id}:${i.text}"
            res.append(name)
            res.append(", ")
        }
        res.append("]")
        return res.toString()
    }
}
