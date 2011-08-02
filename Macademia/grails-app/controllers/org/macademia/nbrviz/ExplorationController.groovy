package org.macademia.nbrviz

import org.macademia.Graph
import grails.converters.JSON

class ExplorationController {

  def personService
  def similarity2Service
  def json2Service
  def institutionGroupService
  def interestService

  def index = { }

  def json = {
      if (params.rootClass){
          if (params.rootClass == "Person") {
              return personJson()
          } else if (params.rootClass == "Interest") {
              return interestJson()
          } else {
              return(['root':params.id] as JSON)
          }
      }
  }

  def personJson = {
    def root = personService.get(params.id.toLong())
    Graph graph = similarity2Service.calculateExplorationNeighbors(root)
    def data
    if (params.subToken){
        data = json2Service.buildExplorationCentricGraph(root, graph, params.subToken.toLong())
    } else{
        data = json2Service.buildExplorationCentricGraph(root, graph)
    }
    return(data as JSON)
  }

  def interestJson = {
      def root = interestService.get(params.id.toLong())
      Graph graph = similarity2Service.calculateExplorationNeighbors(root)
      def data
      if (params.subToken){
          data = json2Service.buildExplorationCentricGraph(root, graph, params.subToken.toLong())
      } else {
          data = json2Service.buildExplorationCentricGraph(root, graph)
      }
      return(data as JSON)
  }

  def show = {
    render(view : 'show', model : [
            jsonData: json()
    ])
  }
}
