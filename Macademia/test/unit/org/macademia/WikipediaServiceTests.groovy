package org.macademia

import grails.test.*

class WikipediaServiceTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    public void testFoo() {}

//  Unit tests shouldn't rely on external services :(
//    void testEncoding() {
//        Wikipedia w = new Wikipedia()
//        String encoded = w.encodeWikiUrl("My Favorite Things (album)")
//        assertEquals(encoded, "http://en.wikipedia.org/wiki/My_Favorite_Things_%28album%29")
//    }
//
//    void testDecoding() {
//        Wikipedia w = new Wikipedia()
//        String decoded = w.decodeWikiUrl("http://en.wikipedia.org/wiki/My_Favorite_Things_%28album%29")
//        assertEquals(decoded, "My Favorite Things (album)")
//    }

}
