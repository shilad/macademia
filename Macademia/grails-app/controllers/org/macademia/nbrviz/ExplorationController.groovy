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
              return personJson
          } else if (params.rootClass == "Interest") {
              return interestJson
          } else {
              return(['root':params.id] as JSON)
          }
      }
  }

  def personJson = {
    def max
    if(params.maxPerson){
      max = params.maxPerson as int
    }
    else{
      max = 25
    }
    def root = personService.get(params.id.toLong())
    Graph graph = similarity2Service.calculateExplorationNeighbors(root, max)
    def data = json2Service.buildExplorationCentricGraph(root, graph)
    return(data as JSON)
  }

  def interestJson = {
      def max
      def maxint
      if(params.maxPerson){
          max = params.maxPerson as int
          maxint = 15
      }
      else{
          max = 25
          maxint = 15
      }
      def root = interestService.get(params.id.toLong())
      Graph graph = similarity2Service.calculateExplorationNeighbors(root, max, maxint)
      def data = json2Service.buildExplorationCentricGraph(root, graph)
      return(data as JSON)
  }

  def show = {
    def root = personService.get(params.id.toLong())

    render(view : 'show', model : [
            root: root,
            json: json()
    ])
  }
}
