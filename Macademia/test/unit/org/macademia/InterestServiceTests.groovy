package org.macademia

import grails.test.*

class InterestServiceTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testSomething() {
        def interestObjects = []
        mockDomain(Interest, interestObjects)
        Interest i1 = new Interest("foo Bar!")
        Interest i2 = new Interest("foo Barz!")
        i1.save()
        i2.save()

        def service = new InterestService()
        assertNull(service.findByText("foobartz"))
        assertNotNull(service.findByText("F O O BA!R"))
    }
}
