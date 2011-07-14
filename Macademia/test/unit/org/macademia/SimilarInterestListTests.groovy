package org.macademia

import grails.test.GrailsUnitTestCase

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class SimilarInterestListTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testSimilarInterestList() {
        SimilarInterest sim1 = new SimilarInterest(1, 0.1)
        SimilarInterest sim2 = new SimilarInterest(2, 0.1)
        SimilarInterest sim3 = new SimilarInterest(1, 0.3)
        SimilarInterestList list = new SimilarInterestList("1,0.1|2,0.1|1,0.3|")
        assertTrue(list.contains(sim2))
        assertTrue(list.contains(sim3))
        assertEquals(list.size(),2)
        assertTrue(list.get(0).equals(sim3))
        list.add(sim1)
        assertTrue(list.get(0).equals(sim2))
        assertEquals(list.toString(),"2,0.1|1,0.1|")
        assertEquals(list.removeLowest().interestId,1)
    }
}
