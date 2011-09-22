package org.macademia.nbrviz

import org.macademia.Graph
import grails.converters.JSON
import org.macademia.TimingAnalysis

class QueryController {

  def json2Service
  def similarity2Service
  def interestService

  def json = { Set<Long> queryIds ->
      TimingAnalysis ta = new TimingAnalysis('QueryController')
      ta.startTime()
      QueryVizGraph graph = similarity2Service.calculateQueryNeighbors(queryIds, 20)
      ta.recordTime('sim2service')
      def data = json2Service.buildQueryCentricGraph(
              graph,
              params.subToken ? params.subToken.toLong() : 1)
      ta.recordTime('json2service')
      ta.analyze()
      return data as JSON
  }

  def show = {
     render(view : 'show', model : [
        group: params.group,
     ])
  }


  def data = {
      Set<Long> queryIds = params.queryIds.split("_").collect({ it.toLong() }) as HashSet<Long>
      render(json(queryIds))
   }
}
