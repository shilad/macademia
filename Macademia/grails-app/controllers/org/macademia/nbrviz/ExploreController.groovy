package org.macademia.nbrviz

import org.macademia.Graph
import grails.converters.JSON
import org.macademia.TimingAnalysis

class ExploreController {

  def personService
  def similarity2Service
  def json2Service
  def interestService


  def personData = {
      // todo
  }

  def interestData = {
      Long rootId = params.id as Long

      Map<Long, Double> parentWeights = [:]
      if (params.parentIds && params.parentWeights) {
          List<Integer> parentIds = params.parentIds.split("_").collect({ it.toLong() })
          List<Integer> weights = params.parentWeights.split("_").collect({ it.toInteger() })
          for (int i = 0; i < parentIds.size(); i++) {
              parentWeights[parentIds[i]] = weights[i] / 5.0
          }
          println("weights are " + parentWeights)
      }

      TimingAnalysis ta = new TimingAnalysis('ExpController.interestData')
      ta.startTime()
      InterestGraph graph = similarity2Service.calculateExplorationNeighbors(
                                        rootId, 20, 4, parentWeights)
      ta.recordTime('sim2service')
      def data = json2Service.buildInterestCentricGraph(
              graph,
              params.subToken ? params.subToken.toLong() : 1)
      ta.recordTime('json2service')
      ta.analyze()
      render(data as JSON)
  }

  def show = {
    render(view : 'show', model : [
        group: params.group,
     ])
  }
}
