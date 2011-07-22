package org.macademia.nbrviz

/**
 * Created by IntelliJ IDEA.
 * User: Aaron Laursen
 * Date: 7/18/11
 * Time: 6:04 PM
 * To change this template use File | Settings | File Templates.
 */

import grails.converters.JSON
import org.macademia.Graph

class PersonExplorationController {
  def personService
  def similarity2Service
  def json2Service
  def institutionGroupService

  def index = { }

  def json = {
      def max
      if(params.maxPerson){
          max = params.maxPerson as int
      }
      else{
          max = 25
      }
      def root = personService.get(params.id.toLong())
      Graph graph = similarity2Service.calculateExplorationNeighbors(root, max)
      def data = json2Service.buildQueryCentricGraph(root, graph)
      render(data as JSON)
  }

  def show = {
      def root = personService.get(params.id.toLong())

      render(view : 'show', model : [
              root: root,
      ])
  }
}
