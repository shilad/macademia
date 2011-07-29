package org.macademia.nbrviz

import org.macademia.Graph
import grails.converters.JSON

/**
 * Created by IntelliJ IDEA.
 * User: research
 * Date: 7/26/11
 * Time: 1:45 PM
 * To change this template use File | Settings | File Templates.
 */
class QueryController {

  def json2Service
  def similarity2Service

  def json = {
      def max
      if(params.maxPerson){
          max = params.maxPerson as int
      }
      else{
          max = 25
      }
      Set<Long> qset = params.qset.tokenize("c_").collect({ it.toLong() })
      Graph graph = similarity2Service.calculateQueryNeighbors(qset, max)
      def data = json2Service.buildQueryCentricGraph(qset, graph)
      return data as JSON
  }

  def show = {
    render(view : 'show', model : [
            qset: params.qset,
            json: json()
    ])
  }
}
