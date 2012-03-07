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

    void testSimilarInterestListMerge() {
        SimilarInterestList list1 = new SimilarInterestList("7,0.4|2,0.2|1,0.1|5,0.05")
        SimilarInterestList list2 = new SimilarInterestList("1,0.3|6,0.25|3,0.2|")
        list1.merge(list2)
        assertEquals(list1.size(), 6);
        assertEquals(list1.get(0).interestId, 7);
        assertEquals(list1.get(1).interestId, 1);
        assertEquals(list1.get(5).interestId, 5);
    }
}
