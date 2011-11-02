package org.macademia.nbrviz

import org.macademia.*

/**
 * This Service supplies data in the JSON format for the construction
 * of the new visualizations.  This data will be slightly different
 * depending upon which graph type, query or exploration, is being
 * constructed.
 *
 * The following JSON is common between the two visualizations, and
 * is the return value of buildJsonForGraph:
 *
 * [
 *      people: [
 *          p_id1: [
 *              id: int
 *              name: string
 *              pic: string
 *              relevance: [
 *                  overall: double,
 *                  id1: double
 *                  ...
 *              ]
 *              count: [
 *                  overall : int,
 *                  id1: int,
 *                  ...
 *              ]
 *              interests: [id1, id2 ...]
 *          ],
 *          p_id2: [ ... ], ...
 *      ]
 *      interests: [
 *          i_id1: [
 *              id: int
 *              name: string
 *              cluster: id of related query interest
 *              relevance : double relevance to query
 *          ],
 *          i_id2: [ ... ], ...
 *      ]
 * ]
 *
 * The query visualization adds the following data to the common
 * datastructure by calling buildQueryCentricGraph:
 *
 * [queries: [id1, id2...]] + jsonForGraph
 *
 *
 */
class Json2Service {

    def collaboratorRequestService
      //max number of interests per interest-centric graph
    static int DEFAULT_MAX_INTERESTS_INTEREST_CENTRIC = 25
    def interestService
    def pseudonymService

    boolean transactional = false

    def makeJsonPerson(Long pid, Object graph, Long sid) {
        def interests = []
        def pedges = graph.personClusterEdges[pid]
        pedges.each({interests.addAll(it.relevantInterestIds)})
        def fakedata = pseudonymService.getFakeData(sid, pid)
        def json = [
                id: pid,
                fid: fakedata.id,
//                name : Person.get(pid).fullName,
                name: fakedata.name,
                pic: fakedata.pic,
                relevance: [:],
                count: [:],
                interests: interests
        ]
        def overallCount = 0
        pedges.each({
            json.relevance[it.clusterId] = it.relevance
            json.count[it.clusterId] = it.relevantInterestIds.size()
            if (it.clusterId >= 0) {
                overallCount += it.relevantInterestIds.size()
            }
        })
        json.relevance.overall = graph.personScores[pid]
        json.count.overall = overallCount
        return json
    }

    def makeJsonInterest(Long iid, Object graph) {
        Interest i = Interest.get(iid)
        InterestInfo ii = graph.interestInfo[iid]
        def o = [
                id : iid,
                name : i.text,
                cluster : ii.closestParentId,
                relevance : ii.closestRelevance,
                roles : []
        ]
        for (InterestRole ir : ii.roles) {
            o.roles.add([
                role : ir.role,
                parentId : ir.parentId,
                relevance : ir.relevance
            ])
        }
        return o
    }

    def buildQueryCentricGraph(QueryGraph graph, Long sid){
        Map<Long, Map> personNodes = [:]
        Map<Long, Map> interestNodes = [:]

        for (Long pid: graph.getPersonIds()){
            personNodes[pid] = makeJsonPerson(pid, graph, sid)
        }

        for (Long iid : graph.interestInfo.keySet()) {
            interestNodes[iid] = makeJsonInterest(iid, graph)
        }

        return [
                'people':personNodes,
                'interests':interestNodes,
                'clusterMap' : graph.getClusterMap()
        ]
    }
    def buildInterestCentricGraph(InterestGraph graph, Long sid){
        Map<Long, Map> personNodes = [:]
        Map<Long, Map> interestNodes = [:]

        for (Long pid: graph.getPersonIds()){
            personNodes[pid] = makeJsonPerson(pid, graph, sid)
        }

        for (Long iid : graph.interestInfo.keySet()) {
            interestNodes[iid] = makeJsonInterest(iid, graph)
        }

        return [
                'people':personNodes,
                'interests':interestNodes,
                'rootId' : graph.rootId,
                'rootClass' : 'interest',
                'clusterMap' : graph.getClusterMap(),
        ]
    }
    def buildPersonCentricGraph(PersonGraph graph, Long sid){
        Map<Long, Map> personNodes = [:]
        Map<Long, Map> interestNodes = [:]

        for (Long pid: graph.getPersonIds()){
            personNodes[pid] = makeJsonPerson(pid, graph, sid)
        }

        for (Long iid : graph.interestInfo.keySet()) {
            interestNodes[iid] = makeJsonInterest(iid, graph)
        }

        return [
                'people':personNodes,
                'interests':interestNodes,
                'rootId' : graph.rootId,
                'rootClass' : 'person',
                'clusterMap' : graph.getClusterMap(),
        ]
    }
}
