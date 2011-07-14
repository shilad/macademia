package org.macademia

class WikipediaService {

    static File wikiCache = null
    static transactional = false
    ThreadLocal<Wikipedia> holder = new ThreadLocal<Wikipedia>()

    /**
     * Returns a list of urls matching the specified query.
     * @param query The textual query.
     * @param maxResults the maximum number of results to return.
     * @return List<String> giving at most maxResults urls which
     * match the given query.
     */
    public List<String> query (String query, int maxResults) {
        if (query == null || query.trim() == "") {
            return []
        }
        try {
            return getWikipedia().query(query, maxResults)
        } catch (Exception e) {
            holder.set(null)
            log.error("wikipedia query for " + query + " failed (${e.getMessage()}... retrying");
            return getWikipedia().query(query, maxResults)
        }
    }

    public Wikipedia getWikipedia() {
        Wikipedia wiki
        wiki = holder.get()
        if (wiki == null) {
            if (wikiCache != null) {
                wiki = new Wikipedia(wikiCache)
            } else {
                wiki = new Wikipedia()
        }
        holder.set(wiki)    
        }
        return wiki
    }

    public String decodeWikiUrl(String url) {
        return getWikipedia().decodeWikiUrl(url)
    }

    public void setCache(File cache){
        wikiCache=cache
        Wikipedia wiki = new Wikipedia(cache)
        holder.set(wiki)
    }

}

