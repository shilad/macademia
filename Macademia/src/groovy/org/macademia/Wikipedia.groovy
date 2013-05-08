package org.macademia

import info.bliki.api.User
import org.json.JSONObject
import org.json.JSONArray
import java.util.logging.Logger;

/**
 * @author Shilad, Brandon
 */
public class Wikipedia {

    private static final Logger LOG = Logger.getLogger(Wikipedia.class.getName());

    private static String WIKIPEDIA_URL = "http://en.wikipedia.org"
    private static String ARTICLE_PREFIX = "${WIKIPEDIA_URL}/wiki/"
    private static String WIKIPEDIA_API_URL = "${WIKIPEDIA_URL}/w/api.php"
    
    private String userName = "macademiabot"
    private String password = "goscots"
    private String apiUrl = WIKIPEDIA_API_URL
    private User user;
    private DiskMap cache = null
    private int minNumResults = 5   // Minimum number of results to _query for

    public Wikipedia() {

    }

    public Wikipedia(File file) {
        cache = new DiskMap(file)
    }

    /**
     * Returns a list of urls matching the specified _query.
     * @param query The textual _query.
     * @param maxResults the maximum number of results to return.
     * @return List<String> giving at most maxResults urls which
     * match the given _query.
     */
    public List<String> query(String query, int maxResults, boolean includeRedirects) {
        if (cache != null && cache.contains(query)) {
            return cache.get(query) as List<String>
        }
        def results = this._query(encodeQuery(query), maxResults, 0, includeRedirects)
        if (cache != null) {
            cache.put(query, results)
        }
        return results
    }

    /**
     * Performs the work of the _query, using the Wikipedia search
     * API to find matching urls.
     * @param query The String _query, already URL encoded.
     * @param maxResults The int maximum number of results to
     * return.
     * @param offset The int offset, used in recursion to specify
     * where to pick up in the search.
     * @return List<String> giving at most maxResults urls which
     * match the given _query.
     */
    private List<String> _query(String query, int maxResults, int offset, boolean includeRedirects) {
        if( maxResults > minNumResults ) {
            minNumResults = maxResults
        }
        List<String> results = []
        if (maxResults == 0) {
            return results
        }
        JSONObject response = performQuery(query, minNumResults, offset)
        JSONArray resArray = response.getJSONObject("query").getJSONArray("search")
        boolean hasSuggestion = response.getJSONObject("query").getJSONObject("searchinfo").has("suggestion")
        if (resArray.length() == 0 && !hasSuggestion) {
            return results
        }

        if (resArray.length() > 0) {
            // results for _query returned, use them
            for (int i = 0; i < resArray.length(); i++) {
                if (!includeRedirects && resArray.get(i)["snippet"].contains("refer to")) {
                    LOG.info("skipping redirect / disambiguation page ${resArray.get(i).get('title')}")
                } else {
                    // result is not a disambiguation page
                    def result = resArray.get(i)["title"] as String
                    if( Interest.normalize( encodeQuery(result) ) == Interest.normalize(query) ) {
                        results.add( 0, encodeWikiUrl(result) )
                    }
                    else {
                        results.add( encodeWikiUrl(result) )
                    }
                }
            }
        } else if (hasSuggestion) {
            // search for the suggestion if there were no results
            def result = response.getJSONObject("query").getJSONObject("searchinfo").get("suggestion") as String
            results.addAll(this._query(encodeQuery(result), maxResults, 0, includeRedirects))
        }

        // Check to see if more results are needed, or if there are too many
        if (results.size() < maxResults) {
            results.addAll(this._query(query, maxResults-results.size(), offset+minNumResults, includeRedirects))
        } else if (results.size() > maxResults) {
            results = results.subList(0, maxResults)
        }
        
        return results
    }

    /**
     * Performs the parameter _query and returns the result.
     * @param query The String encoded _query to be performed.
     * @maxResults The maximum number of results to return.
     * @offset The offset at which to start pulling results from.
     * @return A JSONObject of the _query's result.
     */
    private JSONObject performQuery(String query, int maxResults, int offset) {
        def type = "?action=query&list=search&format=json&srprop=snippet&what=text"
        def limitAndOffset = "&srlimit=$maxResults&sroffset=$offset"
        def search = "&srsearch=$query"
        URL url = new URL(WIKIPEDIA_API_URL + type + limitAndOffset + search)
        URLConnection connection = url.openConnection()

        // Get the response
        String line
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))
        return new JSONObject(reader.getText())
    }

    /**
     * Encodes a String into a form safe for use in querying
     * the Wikipedia search API.
     * @param query The String to be encoded.
     * @return The encoded String.
     */
    public String encodeQuery(String query) {
        // Convert spaces to +, etc. to make a valid URL
        query = URLEncoder.encode(query, "UTF-8");
        // Wiki interprets '-' as NOT, which is not desired here
        return query.replaceAll("-", "+")
    }

    
    /**
     * Returns the title of a Wikipedia page located at a particular URL. 
     */
    public static String decodeWikiUrl(String url) {
        if (url.indexOf("/") < 0) {
            return null
        }
        String ending = url.substring(url.lastIndexOf("/")+1);
        String decoded = URLDecoder.decode(ending, "UTF-8");
        return decoded.replace('_', ' ');
    }

    /**
     * Returns the url location of a Wikipedia page with a particular title.
     */
    public static String encodeWikiUrl(String name) {
        String encoded = name.replace(' ', '_')
        return ARTICLE_PREFIX + URLEncoder.encode(encoded, "UTF-8")
    }

}