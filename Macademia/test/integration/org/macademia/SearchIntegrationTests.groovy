package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class SearchIntegrationTests extends GrailsUnitTestCase {
    def searchService
    def personService
    def searchableService
    def collaboratorRequestService
    def databaseService
    def interestService

    protected void setUp() {
        super.setUp()
        searchableService.reindex()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }
    
    void testPersonSearch() {
        def shilad = personService.findByEmail("ssen@macalester.edu")
        def arjun = personService.findByEmail("guneratne@macalester.edu")
        def dianna = personService.findByEmail("shandy@macalester.edu")

        assertNotNull(shilad)
        assertNotNull(arjun)
        assertNotNull(dianna)
        def people = searchService.searchPeople("shilad", 0, 10)
        assertEquals(people.size(), 1)
        assertEquals(people[0], shilad)
        people = searchService.searchPeople("ssen@macalester.edu", 0, 10)
        assertEquals(people.size(), 1)
        assertEquals(people[0], shilad)
        people = searchService.searchPeople("anthropology", 0, 10)
        assertEquals(people.size(), 2)
        assertTrue(people[0].equals(arjun) || people[1].equals(arjun))
        assertTrue(people[0].equals(dianna) || people[1].equals(dianna))
    }

    void testInterestSearch() {
        def interests = searchService.searchInterests("foo", 0, 10)
        assertEquals(interests.size(), 0)
        interests = searchService.searchInterests("web20", 0, 10)
        assertEquals(interests.size(), 1)
        interests = searchService.searchInterests("psychology", 0, 10)

        assertEquals(interests.size(), 5)
    }

    void testInstitutionSearch() {
        Institution institution = Institution.findByName("macalester")
        if (institution == null) {
            institution = new Institution(name: "macalester", emailDomain: "@macalester.edu")
        }
        def institutions = searchService.searchInstitutions("macalester")
        assertEquals(institutions.size(), 1)

    }
    
    void testCollaboratorRequestsSearch(){
        searchableService.reindex()
        CollaboratorRequest cr = new CollaboratorRequest(title:"Test RFC", description:"Test RFC", creator:personService.findByEmail("ssen@macalester.edu"), dateCreated:new Date(), expiration:new Date())
        cr.addToKeywords(interestService.findByText("online communities"))
        cr.addToKeywords(interestService.findByText("social networking"))
        cr.addToKeywords(interestService.findByText("data mining"))
        cr.addToKeywords(interestService.findByText("web2.0"))
        collaboratorRequestService.save(cr)
        //Utils.safeSave(cr)
        def requests =  searchService.searchCollaboratorRequests("Test", 0, 10)
        //assertTrue(cr.save()!= null)
        assertEquals(CollaboratorRequest.findAllByTitle("Test RFC").size(),1)
        assertEquals(requests.size(),1)
    }


}
