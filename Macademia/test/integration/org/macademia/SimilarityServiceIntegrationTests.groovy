package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class SimilarityServiceIntegrationTests extends GrailsUnitTestCase {
    def similarityService
    def interestService
    def collaboratorRequestService
    def databaseService

    protected void setUp() {
        super.setUp()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        databaseService.clearCache()
        interestService.initBuildDocuments("db/test/")
         // similarityService.refinedThreshold = 0.8
        //similarityService.minSimsPerInterest = 1
        //similarityService.numSimsPerInterest = 2
        //similarityService.maxSimsPerInterest = 3
        //similarityService.analyze()     // rebuild
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }

    void testGetSimilarInterests(){
        Interest interest= interestService.findByText("web2.0")
        SimilarInterestList list= similarityService.getSimilarInterests(interest, 2, 0.0)
        assertEquals(list.size(),2)
        SimilarInterest ir =list.get(0)
        Interest second= interestService.findByText("online communities")
        assertEquals(Interest.get(ir.interestId), second)
    }

    void testCalculateInterestNeighbors() {
        def shilad = Person.findByEmail("ssen@macalester.edu")
        assertNotNull(shilad)
        Interest interest = interestService.findByText("web2.0")
        Graph graph = similarityService.calculateInterestNeighbors(interest, 4, 100)
        //assertEquals(graph.edgeSize(),14)
        //Edge e1= new Edge(interest:interest, relatedInterest:interestService.findByText("online communities"))
        //assertTrue(graph.getAdjacentEdges(interest).contains(e1))
        //Edge e2= new Edge(interest:interestService.findByText("online communities"), relatedInterest:interest)
        //assertTrue(graph.getAdjacentEdges(interest).contains(e2))
        //Edge e3= new Edge(person:shilad ,interest: interestService.findByText("data mining"))
        //assertTrue(graph.getAdjacentEdges(shilad).contains(e3))
        ///Edge e4 = new Edge( interest: interest, relatedInterest:interestService.findByText("globalization"))
        //assertTrue(graph.getAdjacentEdges(interest).contains(e4))
        CollaboratorRequest cr = new CollaboratorRequest(title:"Test RFC", description:"This is a test request for collaboratorRequest", creator:Person.findByEmail("ssen@macalester.edu"), dateCreated: new Date(), expiration: new Date())
        cr.addToKeywords(interestService.findByText("web20"))
        collaboratorRequestService.save(cr)
        graph= similarityService.calculateInterestNeighbors(interest,10, 100)
        assertEquals(graph.getRequests().size(),1)
        assertEquals(graph.getPeople().size(),3)
        assertEquals(graph.getInterests().size(),7)
    }

    void testCalculatePersonNeighbors () {
        Person p=Person.findByEmail("michelfelder@macalester.edu")
        Graph graph= similarityService.calculatePersonNeighbors(p,10)
        assertEquals(graph.getAdjacentEdges(p).size(),15)
        Edge e = new Edge(person:Person.findByEmail("ssen@macalester.edu"),interest:interestService.findByText("existentialism"), relatedInterest:interestService.findByText("web2.0"))
        assertFalse(graph.getAdjacentEdges(Person.findByEmail("ssen@macalester.edu")).contains(e))
        e=new Edge(person:Person.findByEmail("michelfelder@macalester.edu"),interest:interestService.findByText("existentialism"))
        assertTrue(graph.getAdjacentEdges(Person.findByEmail("michelfelder@macalester.edu")).contains(e))
        e=new Edge(person:Person.findByEmail("guneratne@macalester.edu"),interest:interestService.findByText("web2.0"), relatedInterest:interestService.findByText("globalization"))
        //assertTrue(graph.getAdjacentEdges(Person.findByEmail("guneratne@macalester.edu")).contains(e))
        assertEquals(graph.getPeople().size(),5)
        assertEquals(graph.getInterests().size(),15)
        CollaboratorRequest cr = new CollaboratorRequest(title:"Test RFC", description:"This is a test request for collaboratorRequest", creator:Person.findByEmail("ssen@macalester.edu"), dateCreated: new Date(), expiration: new Date())
        cr.addToKeywords(interestService.findByText("web2.0"))
        collaboratorRequestService.save(cr)
        graph= similarityService.calculatePersonNeighbors(p,10)
        assertEquals(graph.getRequests().size(),1)
        assertEquals(graph.getPeople().size(),5)
        assertEquals(graph.getInterests().size(),15)
    }

    void testCalculateRequestNeighbors () {
        CollaboratorRequest cr = new CollaboratorRequest(title:"Test RFC", description:"This is a test request for collaboratorRequest", creator:Person.findByEmail("ssen@macalester.edu"), dateCreated: new Date(), expiration: new Date())
        cr.addToKeywords(interestService.findByText("web2.0"))
        cr.addToKeywords(interestService.findByText("online communities"))
        cr.addToKeywords(interestService.findByText("social networking"))
        cr.addToKeywords(interestService.findByText("data mining"))
        collaboratorRequestService.save(cr)
        Graph graph= similarityService.calculateRequestNeighbors(cr,10)
        assertTrue(graph.getInterests().contains(interestService.findByText("online communities")))
        assertTrue(graph.getInterests().contains(interestService.findByText("social networking")))
        assertTrue(graph.getInterests().contains(interestService.findByText("data mining")))
        assertTrue(graph.getInterests().contains(interestService.findByText("web2.0")))
        assertTrue(graph.getPeople().contains(Person.findByEmail("ssen@macalester.edu")))
        assertTrue(graph.getPeople().contains(Person.findByEmail("strauss@macalester.edu")))
        //assertTrue(graph.getPeople().contains(Person.findByEmail("guneratne@macalester.edu")))
        assertTrue(graph.getPeople().contains(Person.findByEmail("michelfelder@macalester.edu")))
        assertEquals(graph.getPeople().size(),4)
        assertEquals(graph.getInterests().size(),4)
        assertEquals(graph.getRequests().size(),1)
        assertEquals(graph.getAdjacentEdges(cr).size(),4)
        assertEquals(graph.getAdjacentEdges(Person.findByEmail("michelfelder@macalester.edu")).size(),3) //was 3
        assertEquals(graph.getAdjacentEdges(interestService.findByText("online communities")).size(),10)
        assertEquals(graph.getAdjacentEdges(interestService.findByText("data mining")).size(),9)//was 10
        assertEquals(graph.getAdjacentEdges(interestService.findByText("social networking")).size(),2)
        Edge e1 = new Edge(person:Person.findByEmail("ssen@macalester.edu"),interest:interestService.findByText("data mining"),relatedInterest:interestService.findByText("statistics"))
        Edge e2 = new Edge(person:Person.findByEmail("ssen@macalester.edu"),interest:interestService.findByText("web2.0"),relatedInterest:interestService.findByText("data mining"))
        Edge e3 = new Edge(person:Person.findByEmail("ssen@macalester.edu"),interest:interestService.findByText("web2.0"),relatedInterest:interestService.findByText("social networking"))
        assertTrue(graph.getAdjacentEdges(Person.findByEmail("ssen@macalester.edu")).contains(e1))
        assertFalse(graph.getAdjacentEdges(Person.findByEmail("ssen@macalester.edu")).contains(e2)) //shouldn't be in the graph, because a direct person 5 to interest 3 edge exists
        assertFalse(graph.getAdjacentEdges(Person.findByEmail("ssen@macalester.edu")).contains(e3))
    }

    void testBuildInterestRelations () {
        Interest interest= interestService.findByText("web2.0")
        SimilarInterestList list= similarityService.getSimilarInterests(interest, similarityService.maxSimsPerInterest, 0)
        assertEquals(list.size(),7)
        Interest i = interestService.analyze("GIS")
        Interest i2= interestService.analyze("GIS (Geographic Information System)")
        Interest i3= interestService.analyze("e-democracy")
        SimilarInterestList nlist= similarityService.getSimilarInterests(interest, 100,0)
        // I believe this should now be 11, since we have added 3 interests and got similar interests for web2.0 with a threshold for 0
        assertEquals(nlist.size(),10)
        SimilarInterestList nlist2= similarityService.getSimilarInterests(i, 100,0)
        assertEquals(nlist2.size(),9)
        assertTrue(nlist2.contains(new SimilarInterest(i2.id, 0)))
        SimilarInterest ir = nlist2.get(0)
        SimilarInterest ir2= new SimilarInterest(i.id, ir.similarity)
        SimilarInterestList nlist3 = similarityService.getSimilarInterests(Interest.get(ir.interestId), 100,0)
        assertTrue(nlist3.contains(ir2))

    }
}
