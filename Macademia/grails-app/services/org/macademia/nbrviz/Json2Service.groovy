package org.macademia.nbrviz

import org.macademia.*


class Json2Service {

/* buildJsonForGraph returns base json map in format
 *  {people:{
 *           id:{
 *              id:long
 *               name:string
 *               pic:string
 *               relevence:{
 *                         overall:double,
 *                         id1:double
 *                         ...
 *               }
 *               interests:[id1, id2 ...]
 *           }
 *  interests:{
 *           id:{
 *               id:long
 *               name:string
 *               cluster:int
 *           }
 *  }
 * }
 */

/* buildQueryCentricGraph returns json
 *
 *['queries':[id1,id2...]] +jsonforgraph
 *see above
 *
 */

/*buildExplorationCentricGraph returns json
 *
 *['root':id]+jsonforgraph
 *see above
 *
 */


    def collaboratorRequestService
      //max number of interests per interest-centric graph
    int DEFAULT_MAX_INTERESTS_INTEREST_CENTRIC = 25
    def similarity2Service
    def interestService

    boolean transactional = true

    def makeJsonQuery(Interest i){
         return [
                 id: i.id,
                 name: i.text,
                 relatedInterestes:similarity2Service.similarityService.getSimilarInterests(i)
         ]
    }

    def makeJsonPerson(Person p) {
        def interests = []
        for (i in p.interests){
            interests.add(i.id)
        }
        return [
                id: p.id,
                name: p.fullName,
                pic: "http://s3.amazonaws.com/kym-assets/photos/images/original/000/000/169/leekspin.gif",
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



    def buildJsonForGraph(Graph graph){
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        graph.clusterRootInterests()
        for (Person p: graph.getPeople()){
            personNodes[p.id] = makeJsonPerson(p)
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


    def buildQueryCentricGraph(Set<Long> qset, Graph graph){
        def basejson = buildJsonForGraph(graph)
        for (Person p : graph.getPeople()){
            for (Edge e : graph.getAdjacentEdges(p)){
                if (qset.contains(e.interestId)){
                    basejson['people'][p.id]['relevence'][e.interestId] = e.sim
                }
            }
        }
        return ['queries':qset] + basejson
    }

    def buildExplorationCentricGraph(Object root, Graph graph){
        def basejson = buildJsonForGraph(graph)
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

}
