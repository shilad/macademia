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
 *              relevence: [
 *                  overall: double,
 *                  id1: double
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
    def similarity2Service
    def interestService
    def pseudonymService

    boolean transactional = true

    def makeJsonQuery(Interest i){
         return [
                 id: i.id,
                 name: i.text,
                 relatedInterestes: similarity2Service.getSimilarInterests(i)
         ]
    }

    def makeJsonPerson(Person p, Long sid) {
        def interests = []
        for (i in p.interests){
            interests.add(i.id)
        }
        def fakedata = pseudonymService.getFakeData(sid, p.id)
        return [
                id: p.id,
                fid: fakedata.id,
                name: fakedata.name,
                pic: fakedata.pic,
                relevence: [:],
                interests: interests
        ]
    }

    def makeJsonInterest(Interest i){
        return [
                id: i.id,
                name: i.text,
                cluster:-1
        ]
    }


    def buildJsonForGraph(Graph graph, Long sid){
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        graph.clusterRootInterests()
        for (Person p: graph.getPeople()){
            personNodes[p.id] = makeJsonPerson(p, sid)
            personNodes[p.id]['relevence']['overall'] = graph.personScores[p.id].score[0]
            for (Edge e: graph.getAdjacentEdges(p)){
                e.reify()
                def iid = e.interest.id
                if(!interestNodes[iid]){
                    interestNodes[iid] = makeJsonInterest(e.interest)
                }
            }
        }
        for (Map.Entry<Long, Integer> entry : graph.interestClusters.entrySet()){
            if (interestNodes.containsKey(entry.key)){
                interestNodes[entry.key]['cluster'] = entry.value
            }
        }
        return ['people':personNodes] + ['interests':interestNodes]
    }


    def buildQueryCentricGraph(Set<Long> qset, Graph graph, Long sid){
        def basejson = buildJsonForGraph(graph, sid)
        for (Person p : graph.getPeople()){
            for (Edge e : graph.getAdjacentEdges(p)){
                if (qset.contains(e.interestId)){
                    basejson['people'][p.id]['relevence'][e.interestId] = e.sim
                }
            }
        }
        return ['queries':qset] + basejson
    }

    def buildExplorationCentricGraph(Object root, Graph graph, Long sid){
        def basejson = buildJsonForGraph(graph, sid)
        def clusters=[:]
        for(MapEntry e: graph.interestClusters.entrySet()){
            if(!clusters[e.value]){
                clusters[e.value] = []
            }
            clusters[e.value].add(e.key)
        }
        for (Person p : graph.getPeople()){
            for (Integer cid : clusters.keySet()){
                basejson['people'][p.id]['relevence'][cid] = graph.clusterSimilarity(p.interests.collect({ it.id }) as Collection<Long>, clusters[cid] as Collection<Long> )
            }
        }
        return ['root':root.id] + basejson
    }

    def buildExplorationCentricGraph(Object root, Graph graph){
        buildExplorationCentricGraph(root,graph,0)
    }

    def buildQueryCentricGraph(Set<Long> qset, Graph graph){
        buildQueryCentricGraph(qset, graph, 0)
    }
}
