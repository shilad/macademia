package org.macademia.nbrviz

import grails.test.GrailsUnitTestCase
import org.codehaus.groovy.grails.commons.ConfigurationHolder
import org.macademia.*

class Json2ServiceIntegrationTests extends GrailsUnitTestCase {
    def personService
    def json2Service
    def jsonService
    def similarity2Service
    def databaseService



    protected void setUp() {
        super.setUp()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }

    void testQueryCentricGraph() {
        def root = personService.findByEmail('ssen@macalester.edu')
        def qset = root.interests.collect({it.id}) as Set
        Graph graph = similarity2Service.calculateQueryNeighbors(qset)
        def jsonGraph = json2Service.buildQueryCentricGraph(qset, graph) as Map
//        println jsonGraph.toString()
        assert(graph.interestClusters.values().size() >= 1)
        assertNotNull(jsonGraph.people)
        assertNotNull(jsonGraph.interests)
        assert(jsonGraph.people.keySet().contains(root.id))
    }

    void testExplorationCentricGraph() {
        def root = personService.findByEmail('ssen@macalester.edu')
        Graph graph = similarity2Service.calculateExplorationNeighbors(root)
        def jsonGraph = json2Service.buildExplorationCentricGraph(root, graph) as Map
//        println jsonGraph.toString()
        assert(graph.interestClusters.values().size() >= 1)
        assertNotNull(jsonGraph.people)
        assertNotNull(jsonGraph.interests)
        assert(jsonGraph.people.keySet().contains(root.id))
    }
}
