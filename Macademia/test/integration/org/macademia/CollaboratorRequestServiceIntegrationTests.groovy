package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class CollaboratorRequestServiceIntegrationTests extends GrailsUnitTestCase {

    def collaboratorRequestService
    def interestService
    def personService
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

    void testSave() {
        Institution mac = Institution.findByEmailDomain("macalester.edu")
        assertNotNull(mac)
        Person creator = new Person(fullName: "joe", email: "joe@macalester.edu", department: "Math/CS")
        personService.create(creator, 'useR123!', [mac])
        CollaboratorRequest cr = new CollaboratorRequest(title: "Macademia", creator: creator, description: "kld", dateCreated: new Date(), expiration: new Date())
        assertEquals(Interest.findAllByText("macademia").size(),0)
        assertTrue(Interest.findByText("macademia")==null)
        cr.addToKeywords(interestService.analyze("macademia"))
        cr.addToKeywords(interestService.analyze("tagging"))
        collaboratorRequestService.save(cr)
        assertEquals(CollaboratorRequest.findAll().size(),1)
        assertTrue(CollaboratorRequest.findByTitle("Macademia")!=null)
        assertTrue(Interest.findByText("macademia")!=null)
    }

}
