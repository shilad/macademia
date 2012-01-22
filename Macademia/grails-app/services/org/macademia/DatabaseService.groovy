package org.macademia

import com.mongodb.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class DatabaseService {

    Mongo mongo = new Mongo((String)ConfigurationHolder.config.dataSource.mongoDbUrl)
    MongoWrapper wrapper = new MongoWrapper(
                                    mongo,
                                    (String)ConfigurationHolder.config.dataSource.mongoDbName,
                                    (String)ConfigurationHolder.config.dataSource.wpMongoDbName
                                )

    public void changeDB(String dbName){
        wrapper.changeDB(dbName)
    }

    public DB getDb() {
        return wrapper.getDb()
    }

    public void copyDB(String toCopy, String dbName) {
        wrapper.copyDB(toCopy, dbName)
    }

    public void dropDB(String dbName) {
        wrapper.dropDB(dbName)
    }

    public void dropCurrentDB(){
        wrapper.dropCurrentDB()
    }

    public void switchToCopyDB(String toCopy) {
        wrapper.switchToCopyDB(toCopy)

    }

    public DBObject findById(String collection, Long id) throws IllegalArgumentException{
        return wrapper.findById(collection, id, false)
    }

    public DBObject safeFindById(String collection, Long id){
        return wrapper.safeFindById(collection, id, false)
    }

    public void addUser(Person user) throws RuntimeException {
        long id = user.id
        if(id == null){
            throw new RuntimeException("User needs an ID")
        }
        Set<Interest> interests=user.interests
        List<Long> interestIds = new ArrayList<Long>()
        for(Interest interest : interests){
            if(interest.id ==null){
                throw new RuntimeException("User has an interest with out an ID")
            }
            interestIds.add(interest.id)
            //log.info("Interest ID: "+ interest + "for User ID: " + id)
        }
        List<Long> institutionIds = user.memberships.institution.id
        for (Long institutionId: institutionIds) {
            if(institutionId == null){
                throw new RuntimeException("user has an institution with no ID")
            }
        }
        wrapper.addUser(id, interestIds, institutionIds)
    }

    public List<List<Long>> removeUser(Long userId) {
        return wrapper.removeUser(userId);
    }

    public Set<Long> getUserInstitutions(long id){
        return wrapper.getUserInstitutions(id)
    }

    public Set<Long> getUserInterests(long id){
        return wrapper.getUserInterests(id)
    }

    public Set<Long> getInterestUsers(long id) {
        return wrapper.getInterestUsers(id)
    }

    public void updateInterestUsage(long id) {
        wrapper.updateInterestUsage(id)
    }

    public int getInterestUsage(long id) {
        return wrapper.getInterestUsage(id)
    }

    public Set<Long> getInterestRequests(long id) {
        return wrapper.getInterestRequests(id)
    }

    public void addCollaboratorRequest(CollaboratorRequest rfc){
        List<Long> interestIds = new ArrayList<Long>()
        for(Interest interest : rfc.keywords){
            if(interest.id ==null) {
                throw new RuntimeException("User has an interest with out an ID")
            }
            interestIds.add(interest.id)
        }
        wrapper.addCollaboratorRequest(rfc.id, interestIds, rfc.creator.id, rfc.creator.memberships.institution.id.toList())
    }

    public Set<Long> getCollaboratorRequestInstitutions(long id){
        return wrapper.getCollaboratorRequestInstitutions(id)
    }

    public long getCollaboratorRequestCreator(long id){
        return wrapper.getCollaboratorRequestCreator(id)
    }

    public Set<Long> getRequestKeywords(long id){
        return wrapper.getRequestKeywords(id)
    }

    public List<Long> removeCollaboratorRequest(CollaboratorRequest rfc) {
        return wrapper.removeCollaboratorRequest(rfc.id)
    }

    /**
     *
     * @param firstInterest the interest to be added to
     * @param secondInterest the similar interest to be added
     * @param similarity the similarity between the interests
     */
    public void addToInterests(Interest firstInterest, Interest secondInterest, double similarity){
        wrapper.addToInterests((long)firstInterest.id, (long)secondInterest.id, similarity)
    }


    public void addToInterests(long firstId, long secondId, double sim) {
        wrapper.addToInterests(firstId, secondId, sim)
    }

    /**
     * Removes an interest from the user
     * @param interestId The interest to remove
     * @param userId The user to remove the interest from
     * @return true if the removal caused the interest to be
     * removed completely from the database, false otherwise
     */
    public boolean removeInterestFromUser(Long interestId, Long userId) {
        return wrapper.removeInterestFromUser(interestId, userId);
    }

    /**
     * Removes a keyword from the request
     * @param keywordId The keyword to remove
     * @param requestId The request to remove the keyword from
     * @return true if the removal caused the keyword/interest to
     * be removed completely from the database, false otherwise
     */
    public boolean removeKeywordFromRequest(Long keywordId, Long requestId) {
        return wrapper.removeKeywordFromRequest(keywordId, requestId);
    }

   /**
    * Removes the secondInterest from the firstInterest's list of
    * similar interests.
    * @param firstInterest the interest to be removed from
    * @param secondInterest the similar interest to be removed
    */
    public void removeSimilarInterest(Interest firstInterest, Interest secondInterest){
        wrapper.removeSimilarInterest((long)firstInterest.id, (long)secondInterest.id)
    }

    /**
     * Removes orphaned interests. Should calling this method
     * be necessary more than once, we are doing something wrong.
     * @return List<Long> ids of the reaped orphans
     */
    public List<Long> reapOrphans() {
        return wrapper.reapOrphans();
    }


    public SimilarInterestList getSimilarInterests(Interest interest){
        return wrapper.getSimilarInterests((long)interest.id)
    }

    public SimilarInterestList getSimilarInterests(Interest interest, InstitutionFilter institutionFilter) {
        return wrapper.getSimilarInterests(interest.id, institutionFilter)
    }

    public SimilarInterestList getSimilarInterests(Long id) {
        return wrapper.getSimilarInterests(id)
    }

    public SimilarInterestList getSimilarInterests(Long id, InstitutionFilter institutionFilter) {
        return wrapper.getSimilarInterests(id, institutionFilter)
    }

    public Map<Long, Map<Long, Double>> getIntraInterestSims(Set<Long> interestIds, boolean normalize) {
        return wrapper.getIntraInterestSims(interestIds, normalize)
    }

    public void removeLowestSimilarity(Interest interest) {
        wrapper.removeLowestSimilarity(interest.id)
    }


    public void cleanupInterestRelations(Set<Long> validIds) {
        wrapper.cleanupInterestRelations(validIds)
    }

    public void cleanupPeople(Set<Long> validIds){
        wrapper.cleanupPeople(validIds)
    }


    public void cleanupCollaboratorRequests(Set<Long> validIds){
        wrapper.cleanupCollaboratorRequests(validIds)
    }

   /**
    *
    * @param interest the interest to replace lowest similarity in
    * @param second the new similar interest
    * @param similarity the new similarity
    */
    public void replaceLowestSimilarity(Interest interest, Interest newInterest, double similarity){
        wrapper.replaceLowestSimilarity(interest.id, newInterest.id, similarity)
    }

    public Set<Long> getInstitutionInterests(long institutionId) {
        return wrapper.getInstitutionInterests(institutionId)
    }

    public void addInterestToArticle(Interest interest, long article){
        wrapper.addInterestToArticle(interest.id, article);
    }


    public WikipediaPage getArticleInfo(String title) {
        return wrapper.getArticleInfo(title);
    }

    public WikipediaPage getArticleInfo(long pageId) {
        return wrapper.getArticleInfo(pageId);
    }

    public long articleToId(String title){
        return wrapper.articleToId(title);
    }

    public SimilarInterestList getArticleSimilarities(long pageId) {
        return wrapper.getArticleSimilarities(pageId)
    }

    public void buildInterestRelations(String text, long interest, long article, boolean relationsBuilt) {
        wrapper.buildInterestRelations(text, interest, article, relationsBuilt)
    }

    public void updateArticlesToInterests(Map<Long, Set<Long>> newMapping) {
        wrapper.updateArticlesToInterests(newMapping)
    }

    public void extractSmallWpDb(String destDb) {
        wrapper.extractSmallWpDb(destDb)
    }

    public void clearCache(){
        wrapper.clearCache()
    }
}
