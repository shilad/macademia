package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class JsonServiceIntegrationTests extends GrailsUnitTestCase {
    def personService
    def jsonService
    def interestService
    def collaboratorRequestService
    def similarityService
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

    void testUserCentricGraph() {
        Person testPerson1 = personService.findByEmail("ssen@macalester.edu")
        Person testPerson2 = personService.findByEmail("michelfelder@macalester.edu")
        Graph graph = similarityService.calculatePersonNeighbors(testPerson1, 25)
        def jsonGraph = jsonService.buildUserCentricGraph(testPerson1, graph).toString()
        def person1Json = jsonService.makeJsonForPerson(testPerson1)
        def person2Json = jsonService.makeJsonForPerson(testPerson2)
//        println("json data is $jsonGraph")
        assertEquals(person1Json['name'],testPerson1.fullName)
        assertTrue(jsonGraph.contains(person1Json['name']))
        assertTrue(jsonGraph.contains(person1Json['data'].toString()))
        assertTrue(jsonGraph.contains(person2Json['name']))
        int i = testPerson1.fullName.hashCode() % org.macademia.MacademiaConstants.COLORS.size()
        assertTrue(jsonGraph.contains(org.macademia.MacademiaConstants.COLORS[i]))
    }


    void testInterestCentricGraph() {
        Interest i = interestService.findByText("South Asia")
        Interest i2 = interestService.findByText("Nepal")
        Person p = personService.findByEmail("guneratne@macalester.edu")
        Graph graph = similarityService.calculateInterestNeighbors(i, 25, jsonService.DEFAULT_MAX_INTERESTS_INTEREST_CENTRIC)
        def jsonGraph = jsonService.buildInterestCentricGraph(i, graph).toString()
        def iJson = jsonService.makeJsonForInterest(i)
        //println("json data is $jsonGraph")
        assertEquals(iJson['name'], i.text)
        assertTrue(jsonGraph.contains(iJson['data'].toString()))
        //assertTrue(jsonGraph.contains(i2.text))
        assertTrue(jsonGraph.contains(p.fullName))
    }

    void testCollaboratorRequestGraph() {
        Person p1 = personService.findByEmail("michelfelder@macalester.edu")
        Person p2 = personService.findByEmail("ssen@macalester.edu")
        Person p3 = personService.findByEmail("guneratne@macalester.edu")
        Interest i1 = interestService.findByText("hermeneutics")
        Interest i2 = interestService.findByText("environmentalism")
        Interest i3 = interestService.findByText("Web 2.0")
        Interest i4 = interestService.findByText("group psychology")
        Interest i5 = interestService.findByText("social networking")
        Interest i6 = interestService.findByText("clinical psychology")
        Interest i7 = interestService.findByText("Sri Lanka")
        Interest i8 = interestService.findByText("law")
        CollaboratorRequest c1 = new CollaboratorRequest(title: 'Philosophy Research', description: "I'm investigating cool things", creator: p1, keywords: [i1, i2, i3], dateCreated: new Date(), expiration: new Date())
        CollaboratorRequest c2 = new CollaboratorRequest(title: 'Macademia', description: "I'm investigating awesome things", creator: p2, keywords: [i3, i4, i5],dateCreated: new Date(), expiration: new Date())
        CollaboratorRequest c3 = new CollaboratorRequest(title: 'Anthropology Research', description: "I'm investigating amazing things", creator: p3, keywords: [i6, i7, i8],dateCreated: new Date(), expiration: new Date())
        i1.addToRequests(c1)
        i2.addToRequests(c1)
        i3.addToRequests(c1)
        i3.addToRequests(c2)
        i4.addToRequests(c2)
        i5.addToRequests(c2)
        i6.addToRequests(c3)
        i7.addToRequests(c3)
        i8.addToRequests(c3)
        collaboratorRequestService.save(c1)
        collaboratorRequestService.save(c2)
        collaboratorRequestService.save(c3)
        Graph graph = similarityService.calculateRequestNeighbors(c1, 25)
        def jsonGraph = jsonService.buildCollaboratorRequestCentricGraph(c1, graph).toString()
        def requestJson = jsonService.makeJsonForCollaboratorRequest(c1)
//        def jsonGraph2 = jsonService.buildCollaboratorRequestCentricGraph(c2)
//        def jsonGraph3 = jsonService.buildCollaboratorRequestCentricGraph(c3)
//        def jsonGraph4 = jsonService.buildUserCentricGraph(p2).toString()
        println("json data is $jsonGraph")
//        println("json2 data is $jsonGraph2")
//        println("json3 data is $jsonGraph3")
//        println("json3 data is $jsonGraph4")
        assertEquals(requestJson['name'], c1.title)
        assertTrue(jsonGraph.contains(requestJson['data'].toString()))
        assertTrue(jsonGraph.contains(c2.title))
        assertTrue(jsonGraph.contains(p1.fullName))
        assertTrue(jsonGraph.contains('r_') && jsonGraph.contains('p_') && jsonGraph.contains('i_'))
    }                 
}
