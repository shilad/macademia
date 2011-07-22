package org.macademia.nbrviz

import grails.test.GrailsUnitTestCase
import org.codehaus.groovy.grails.commons.ConfigurationHolder
import org.macademia.*

class Similarity2ServiceIntegrationTests extends GrailsUnitTestCase {
    def similarity2Service
    def similarityService
    def interestService
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

    void testCalculateExplorationNeighborsInterest() {
        def shilad = Person.findByEmail("ssen@macalester.edu")
        assertNotNull(shilad)
        Interest interest = interestService.findByText("web2.0")
        Graph graph = similarity2Service.calculateExplorationNeighbors(interest, 10, 100)
        assertEquals(graph.getPeople().size(),3)
        assertEquals(graph.getInterests().size(),7)
    }

    void testCalculateExplorationNeighborsPeople() {
        Person p=Person.findByEmail("michelfelder@macalester.edu")
        Graph graph= similarity2Service.calculateExplorationNeighbors(p,10)
        assertEquals(graph.getAdjacentEdges(p).size(),15)
        Edge e = new Edge(person:Person.findByEmail("ssen@macalester.edu"),interest:interestService.findByText("existentialism"), relatedInterest:interestService.findByText("web2.0"))
        assertFalse(graph.getAdjacentEdges(Person.findByEmail("ssen@macalester.edu")).contains(e))
        e=new Edge(person:Person.findByEmail("michelfelder@macalester.edu"),interest:interestService.findByText("existentialism"))
        assertTrue(graph.getAdjacentEdges(Person.findByEmail("michelfelder@macalester.edu")).contains(e))
        assertEquals(graph.getPeople().size(),5)
        assertEquals(graph.getInterests().size(),15)
    }

    void testCalculateQueryNeighbors(){
        Person p = Person.findByEmail("ssen@macalester.edu")
        def qset = p.interests.collect({it.id}) as Set
        Graph graph = similarity2Service.calculateQueryNeighbors(qset,10)
        Graph graph2 = similarityService.calculatePersonNeighbors(p,10)
        assertEquals(graph.people, graph2.people)
    }

}
