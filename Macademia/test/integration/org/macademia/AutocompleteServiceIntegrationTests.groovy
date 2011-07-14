package org.macademia

import grails.test.GrailsUnitTestCase
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Shilad
 */

class AutocompleteServiceIntegrationTests extends GrailsUnitTestCase {
    def interestService
    def sessionFactory
    def databaseService
    def autocompleteService
    def similarityService
    def personService

    protected void setUp() {
        super.setUp()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        autocompleteService.init()
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }

    void testSimple() {
        Interest i = Interest.findByText("web 3.0")
        assertNull(i)
        Collection<AutocompleteEntity> results = autocompleteService.getInterestAutocomplete('all', 'web', 5)
        System.out.println(results)
        assertEquals(1, results.size())
        System.out.println(results)

        //There is some problem with normalize text for the space character
        Person p = Person.findByEmail("ssen@macalester.edu")
        Interest interest = new Interest("web 3.0")
        interest.addToPeople(p)
        p.addToInterests(interest)
        personService.save(p)
        results = autocompleteService.getInterestAutocomplete('all', 'web', 5)
        assertEquals(2, results.size())
    }

}