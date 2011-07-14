package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class InterestServiceIntegrationTests extends GrailsUnitTestCase {
    def interestService
    def similarityService
    def databaseService
    def personService
    def autocompleteService

    protected void setUp() {
        super.setUp()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        autocompleteService.init()
        similarityService.relationsBuilt = true
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }

    void testSave() {
        //There is some problem with normalize text for the space character
        interestService.initBuildDocuments("db/test/")
        Interest interest = new Interest("web 4.0")
        Person p = Person.findByEmail("guneratne@macalester.edu")
        interest.addToPeople(p)
        p.addToInterests(interest)
        personService.save(p)
        assertTrue(Interest.findByText("web 4.0").people.contains(p))
        assertTrue(databaseService.getSimilarInterests(Interest.findByText("web 4.0")) != null)
    }

}
