package org.macademia.nbrviz

import org.macademia.Graph
import grails.converters.JSON
import org.macademia.TimingAnalysis

class QueryController {

  def json2Service
  def similarity2Service
  def interestService

  def show = {
     render(view : 'show', model : [
        group: params.group,
     ])
  }


  def data = {
      List<Long> queryIds = params.queryIds.split("_").collect({ it.toLong() })
      List<Integer> weights = params.queryWeights.split("_").collect({ it.toInteger() })
      Map<Long, Double> queryWeights = [:]
      for (int i = 0; i < queryIds.size(); i++) {
          queryWeights[queryIds[i]] = 1.0 * weights[i] / 5.0
      }

      TimingAnalysis ta = new TimingAnalysis('QueryController')
      ta.startTime()
      QueryVizGraph graph = similarity2Service.calculateQueryNeighbors(
                                queryIds as HashSet<Long>, queryWeights, 20)
      ta.recordTime('sim2service')
      def data = json2Service.buildQueryCentricGraph(
              graph,
              params.subToken ? params.subToken.toLong() : 1)
      ta.recordTime('json2service')
      ta.analyze()
      render(data as JSON)
   }
}
