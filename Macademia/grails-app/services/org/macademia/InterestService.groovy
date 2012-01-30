package org.macademia

import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class InterestService implements ApplicationContextAware {

    ApplicationContext applicationContext
    def similarityService
    def wikipediaService
    def databaseService
    def autocompleteService

    boolean transactional = true

    public Interest get(long id) {
        return Interest.get(id)
    }

    public Interest findByText(String text) {
        return Interest.findByNormalizedText(Interest.normalize(text))
    }

    public SimilarInterestList findSimilarities(String interest) {
        Interest i = findByText(interest)
        return (i == null) ? new SimilarInterestList() : findSimilarities(i)
    }

    public SimilarInterestList findSimilarities(Interest interest) {
        return similarityService.getSimilarInterests(interest)
    }

    public void initBuildDocuments(String fileDirectory) {
        wikipediaService.setCache(new File(fileDirectory + "wikipedia_cache.txt"))
    }

    public void updateArticlesToInterests() {
        Map<Long, Set<Long>> articlesToInterests = [:]
        Interest.list().each({
            if (it.articleId < 0) {
                return
            }
            if (!articlesToInterests.containsKey(it.articleId)) {
                articlesToInterests[it.articleId] = new HashSet<Long>()
            }
            articlesToInterests[it.articleId].add(it.id)
        })
        databaseService.updateArticlesToInterests(articlesToInterests)
    }

   /**
    * Finds the most relevant document(s) for the interest
    * @param interest : an interest in the interest list
    */
    public void buildDocuments(Interest interest) {
//        log.info("doing interest ${interest}")
//        double weight = 1.0
        for (String url: wikipediaService.query(interest.text, 3)) {
            String articleName = wikipediaService.decodeWikiUrl(url)
            WikipediaPage wp = databaseService.getArticleInfo(articleName);
            if (wp == null) {
                log.warn("no WP article found with name ${articleName}")
                continue
            }
            WikipediaPage wp2 = dereferencePage(wp, 0)
            if (wp2 == null) {
                log.warn("no WP dereferenced for ${wp}")
                continue
            }
            if (wp2.pageId != wp.pageId) {
                log.info("mapped page $wp to $wp2")
            }
            interest.articleId = wp2.pageId
            interest.articleName = articleName
            databaseService.addInterestToArticle(interest, interest.articleId)
            Utils.safeSave(interest)
            break;  // we found something!
        }
        interest.lastAnalyzed = new Date()
    }

    /**
     * Follows redirects and disambiguations
     * @param page
     * @param depth
     * @return
     */
    private WikipediaPage dereferencePage(WikipediaPage page, int depth) {
        if (depth > 5 || page == null) {
            return null;
        }
        def pref = "    ".multiply(depth);
        //System.err.println("$pref dereferencing $page");
        if (page.isRedirect()) {
            //System.err.println("$pref is redirect!");
            return dereferencePage(databaseService.getArticleInfo(page.redirectId), depth+1);
        } else if (page.isDisambiguation()) {
            //System.err.println("$pref is disambiguation!");
            WikipediaPage best = null
            for (Long dabId : page.disambiguatedIds) {
                def dab = dereferencePage(databaseService.getArticleInfo(dabId), depth+1);
                if (dab != null && (best == null || dab.viewCount > best.viewCount)) {
                    best = dab
                }
            }
            return best
        } else {
            //System.err.println("$pref is normal!");
            //System.err.println("$pref here 1");
            SimilarInterestList sil = databaseService.getArticleSimilarities(page.pageId)
            //System.err.println("$pref here 2");
            if (sil == null || sil.size() <= 1) {
                log.warn("no similar interests for ${page}")
                return null
            } else {
                return page
            }
        }
    }

    public void save(Interest interest) {
        if (interest.id == null) {
            //no interest with text in db, new interest
            //must save prior to finding similar interests
            Utils.safeSave(interest)
        }
        if (interest.articleId < 1 || interest.articleId == null) {
            buildDocuments(interest)
            if (similarityService.relationsBuilt) {
                similarityService.buildInterestRelations(interest)
            }
            Utils.safeSave(interest)
        }
    }

    /**
     * Returns an interest based off of the parameter text.
     * Should the parameter String interest text not be an
     * existing interest, creates and saves the new interest,
     * building its relations.
     * @param text The String interest text to be analyzed.
     * @return An Interest of the parameter text, guaranteed
     * to have been saved and to have relational data.
     */
    public Interest analyze(String text) {
        Interest interest = findByText(text)
        if (!interest) {
            interest = new Interest(text)
            save(interest)
        }
        return interest
    }

    public void delete(person, interestId) {
        autocompleteService.removeInterest(person, interestId)
        Interest.get(interestId).delete()
    }

    public void reapOrphans() {
        List<Long> theReaped = databaseService.reapOrphans()
        for (reaped in theReaped) {
            if (Interest.get(reaped) != null) {
                Interest.get(reaped).delete()
            }
        }

    }

    public void deleteOld(oldInterests, Person person) {
        for (interest in oldInterests) {
            if (!person.interests.contains(interest)) {
                if (interestRemove(interest, person)) {
                    delete(person, interest.id)
                }
            }
        }
    }

    public void deleteOld(oldKeywords, CollaboratorRequest request) {
        for (interest in oldKeywords) {
            if (!request.keywords.contains(interest)) {
                if (keywordRemove(interest, request)) {
                    delete(request.creator, interest.id)
                }
            }
        }
    }

    public interestRemove(Interest interest, Person person) {
        return databaseService.removeInterestFromUser(interest.id, person.id)
    }

    public keywordRemove(Interest keyword, CollaboratorRequest request) {
        return databaseService.removeKeywordFromRequest(keyword.id, request.id)
    }

    public List<Interest> parseInterests(String interests) {
        String[] tokens = tokenizer(interests)
        List<Interest> interestList = []
        for (i in tokens){
            if (i.trim().length() != 0) {
                interestList.add(analyze(i))
            }
        }
        return interestList
    }

    public String[] tokenizer(String interests){
        return interests.trim().split(",")
    }

    public int getInterestCount(Interest interest) {
        return getInterestCount(interest.id)
    }

    public int getInterestCount(Long interestId) {
        autocompleteService.getInterestCount(interestId)
    }

}
