package org.macademia

import grails.test.*

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class InstitutionServiceIntegrationTests extends GrailsUnitTestCase {
    def institutionService
    def databaseService

    protected void setUp() {
        super.setUp()
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testFindByEmailDomain(){
        Institution mac = institutionService.findByEmailDomain("macalester.edu")
        assertNotNull(mac)
    }
}
