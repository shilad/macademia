package org.macademia.nbrviz

import org.macademia.IdAndScore

class QueryVizGraph {
    public static final double CLUSTER_PENALTY = 0.7

    Map<Long, Long> queryIdsToClusters = [:]
    List<Long> queryIds
    Map<Long, IdAndScore> interestClusters = [:]
    Map<Long, Collection<PersonClusterEdge>> personClusterEdges = [:]
    Map<Long, Double> personScores = [:]

    public QueryVizGraph(Collection<Long> queryIds) {
        this.queryIds = [] + queryIds
        for (int i = 0; i < this.queryIds.size(); i++) {
            this.queryIdsToClusters[this.queryIds[i]] = i
        }
    }

    public Collection<Long> getPersonIds() {
        return personScores.keySet()
    }

    public void addRelatedInterest(Long interestId, Long clusterId, double relevance) {
        IdAndScore ids = interestClusters.get(interestId)
        if (ids == null) {
            interestClusters[interestId] = new IdAndScore(clusterId, relevance)
        } else if (ids.score < relevance) {
            ids.id = clusterId
            ids.score = relevance
        }
    }

    public void addPerson(Long pid, Collection<Long> interests) {
        Map<Long, PersonClusterEdge> edges = [:]
        for (Long iid : interests) {
            Long cid = -1
            if (interestClusters.containsKey(iid)) {
                cid = interestClusters[iid].id
            }
            if (!edges.containsKey(cid)) {
                edges[cid] = new PersonClusterEdge(personId : pid, clusterId: cid)
            }
            edges[cid].relevantInterestIds.add(iid)
        }
        personClusterEdges[pid] = edges.values().asList()
    }

    public void ensureAllInterestsExist(Long pid, Collection<Long> interests) {
        Set<Long> existing = new HashSet<Long>()
        personClusterEdges[pid].each({existing.addAll(it.relevantInterestIds)})
        Set<Long> extra = new HashSet<Long>(interests)
        extra.removeAll(existing)
        for (Long iid : extra) {
            interestClusters[iid] = new IdAndScore(-1, 0.0)
        }
        personClusterEdges[pid].add(
                new PersonClusterEdge(
                        personId : pid,
                        clusterId : -1,
                        relevantInterestIds: extra.asList(),
                        relevance: 0.0
                ))
    }

    public void finalizeGraph(int maxPeople) {
        // Find top people
        for (Long pid : personClusterEdges.keySet()) {
            personScores[pid] = scorePersonSimilarity(pid)
        }
        List<Long> pids = new ArrayList<Long>(personScores.keySet())
        pids.sort({ -1 * personScores[it]})
        if (pids.size() > maxPeople) {
            pids = pids.subList(0, maxPeople)
        }

        // prune people
        personScores.keySet().retainAll(pids)
        personClusterEdges.keySet().retainAll(pids)

        // prune interests associated with those people
        Set<Long> iids = new HashSet<Long>(queryIds)
        for (Set<PersonClusterEdge> pedges : personClusterEdges.values()) {
            pedges.each({iids.addAll(it.relevantInterestIds)})
        }
        interestClusters.keySet().retainAll(iids)
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
            e.relevantInterestIds.sort({ -1 * interestClusters[it].score })
            double weight = 1.0
            e.relevance = 0.0
            for (Long iid : e.relevantInterestIds) {
                e.clusterId = interestClusters[iid].id
                e.relevance += interestClusters[iid].score
                weight *= CLUSTER_PENALTY
            }
            sim += e.relevance
        }
        return sim
    }



}

