package org.macademia.nbrviz

import grails.converters.JSON
import org.macademia.TimingAnalysis

class D3Controller {
    def personService
    def similarity2Service
    def json2Service
    def interestService

    def index = {
        render(view : "${params.module}")
    }

    def show = {
        //get nodeId
        Long rootId = params.nodeId as Long
        print(rootId)

        //download json based on the nodeId
//        interestData({params:[id:rootId]})

        //render the view for the first time
        render(view : "${params.module}")
    }

    //for interest centric
    def interestData = {
        Long rootId = params.id as Long

        Map<Long, Double> parentWeights = [:]
        if (params.parentIds && params.parentWeights) {
            List<Integer> parentIds = params.parentIds.split("_").collect({ it.toLong() })
            List<Integer> weights = params.parentWeights.split("_").collect({ it.toInteger() })
            for (int i = 0; i < parentIds.size(); i++) {
                parentWeights[parentIds[i]] = weights[i] / 5.0
            }
        }

        TimingAnalysis ta = new TimingAnalysis('ExpController.interestData')
        ta.startTime()
        InterestGraph graph = similarity2Service.calculateInterestNeighbors(
                                          rootId, 20, 4, parentWeights)
        ta.recordTime('sim2service')
        def data = json2Service.buildInterestCentricGraph(
                graph,
                params.subToken ? params.subToken.toLong() : 1)
        ta.recordTime('json2service')
        ta.analyze()
        render(data as JSON)
    }

    //for person centric
    def personData = {
        Long rootId = params.id as Long

        Map<Long, Double> parentWeights = [:]
        if (params.parentIds && params.parentWeights) {
            List<Integer> parentIds = params.parentIds.split("_").collect({ it.toLong() })
            List<Integer> weights = params.parentWeights.split("_").collect({ it.toInteger() })
            for (int i = 0; i < parentIds.size(); i++) {
                parentWeights[parentIds[i]] = weights[i] / 5.0
            }
        }
        parentWeights[rootId] = 1.0

        TimingAnalysis ta = new TimingAnalysis('ExpController.personData')
        ta.startTime()
        PersonGraph graph = similarity2Service.calculatePersonNeighbors(
                                          rootId, 20, 3, parentWeights)
        ta.recordTime('sim2service')
        def data = json2Service.buildPersonCentricGraph(
                graph,
                params.subToken ? params.subToken.toLong() : 1)
        ta.recordTime('json2service')
        ta.analyze()
        render(data as JSON)
    }
}
