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
 *              id: long
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
 *              id: long
 *              name: string
 *              cluster: int
 *              relevance : double
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
 * Meanwhile, the exploration visualization adds the following data
 * by calling buildExplorationCentricGraph:
 *
 * [root: id] + jsonForGraph
 *
 */
class Json2Service {

    def collaboratorRequestService
      //max number of interests per interest-centric graph
    static int DEFAULT_MAX_INTERESTS_INTEREST_CENTRIC = 25
    def interestService
    def pseudonymService

    boolean transactional = false

    def makeJsonPerson(Long pid, QueryVizGraph graph, Long sid) {
        def interests = []
        def pedges = graph.personClusterEdges[pid]
        pedges.each({interests.addAll(it.relevantInterestIds)})
        def fakedata = pseudonymService.getFakeData(sid, pid)
        def json = [
                id: pid,
                fid: fakedata.id,
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

    def makeJsonInterest(Long iid, QueryVizGraph graph) {
        Interest i = Interest.get(iid)
        return [
                id : iid,
                name : i.text,
                cluster : graph.interestClusters[iid].id,
                relevance : graph.interestClusters[iid].score,
        ]
    }


    def buildQueryCentricGraph(QueryVizGraph graph, Long sid){
        Map<Long, Map> personNodes = [:]
        Map<Long, Map> interestNodes = [:]

        for (Long pid: graph.getPersonIds()){
            personNodes[pid] = makeJsonPerson(pid, graph, sid)
        }

        for (Long iid : graph.interestClusters.keySet()) {
            interestNodes[iid] = makeJsonInterest(iid, graph)
        }

        return [
                'people':personNodes,
                'interests':interestNodes,
                'queries' : graph.queryIds
        ]
    }
}
