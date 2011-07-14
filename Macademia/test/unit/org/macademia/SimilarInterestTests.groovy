package org.macademia

import grails.test.GrailsUnitTestCase

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class SimilarInterestTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testSimilarInterest() {
        SimilarInterest sim1 = new SimilarInterest(1, 0.1)
        SimilarInterest sim2 = new SimilarInterest(2, 0.1)
        SimilarInterest sim3 = new SimilarInterest(1, 0.3)
        assertTrue(sim1.equals( sim3))
        assertEquals(sim1.hashCode(),11)
        assertTrue(sim1.compareTo(sim3)>= 0)
        assertFalse(sim1.equals(sim2))
        assertEquals(sim1.compareTo(sim2),0)
    }
}