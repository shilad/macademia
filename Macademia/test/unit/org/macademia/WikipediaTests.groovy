package org.macademia

import grails.test.*

/**
 * Tests for the Wikipedia client.
 * @author Shilad
 */
class WikipediaTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testEncoding() {
        Wikipedia w = new Wikipedia()
        String encoded = w.encodeWikiUrl("My Favorite Things (album)")
        assertEquals(encoded, "http://en.wikipedia.org/wiki/My_Favorite_Things_%28album%29")
    }

    void testDecoding() {
        Wikipedia w = new Wikipedia()
        String decoded = w.decodeWikiUrl("http://en.wikipedia.org/wiki/My_Favorite_Things_%28album%29")
        assertEquals(decoded, "My Favorite Things (album)")
    }

//    Tests should not rely on external resources, such as Wikipedia
//    void testQuery() {
//        Wikipedia wiki = new Wikipedia()
//        List<String> results = wiki.query("Coltrane", 5)
//        assertEquals(results.size(), 5)
//        assertEquals(results[0], "http://en.wikipedia.org/wiki/John_Coltrane")
//    }

}
