package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class CollaboratorRequestServiceIntegrationTests extends GrailsUnitTestCase {

    def collaboratorRequestService
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
        Interest i1 = new Interest("macademia")
        Interest i2 = new Interest("tagging")
        assertEquals(Interest.findAllByText("macademia").size(),0)
        cr.addToKeywords(i1)
        cr.addToKeywords(i2)
        assertTrue(Interest.findByText("macademia")==null)
        collaboratorRequestService.save(cr)
        assertEquals(CollaboratorRequest.findAll().size(),1)
        assertTrue(CollaboratorRequest.findByTitle("Macademia")!=null)
        assertTrue(Interest.findByText("macademia")!=null)
    }

}
