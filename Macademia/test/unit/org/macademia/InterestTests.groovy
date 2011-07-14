package org.macademia

import grails.test.*

class InterestTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testNormalizedText() {
        Interest i = new Interest("FO.!o B A/R")
        assertEquals(i.normalizedText, "foobar")
        assertEquals(i.text, "FO.!o B A/R")

    }

    void testCompares() {
        Interest i1 = new Interest("foo bar")
        Interest i2 = new Interest("FOO BAR")
        Interest i3 = new Interest("FO.!o B A/R")
        Interest i4 = new Interest("0foobar")
        assertEquals(i1, i2)
        assertEquals(i1, i3)
        assertFalse(i1.equals(i4))
        assertEquals(i1.hashCode(), i2.hashCode())
        assertEquals(i1.hashCode(), i3.hashCode())
        assertFalse(i1.hashCode() == i4.hashCode())
        assertEquals(i1.compareTo(i2), 0)
        assertEquals(i1.compareTo(i3), 0)
        assertFalse(i1.compareTo(i4) == 0)
    }
}
