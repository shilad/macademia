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

class InterestExplorationController {
  def similarity2Service
  def json2Service
  def institutionGroupService
  def interestService

  def index = { }

  def json = {
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
      render(data as JSON)
  }

  def show = {
      def root = interestService.get(params.id.toLong())

      render(view : 'show', model : [
              root: root,
      ])
  }
}
