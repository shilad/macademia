package org.macademia;


import com.mongodb.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.*;
import java.util.logging.Logger;

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
public class MongoWrapper {
    private final static Log LOG = LogFactory.getLog(MongoWrapper.class);

    Mongo mongo ;
    
    //name of the users collection
    public static final String USERS = "users";

    //name of the interests collection
    public static final String INTERESTS = "interests";

    //name of the collaboratorRequests collection
    public static final String COLLABORATOR_REQUESTS = "collaboratorRequests" ;

    //name of the articlesToIds collection
    public static final String ARTICLES_TO_IDS = "articlesToIds";

    //name of the articlesToInterests collection
    public static final String ARTICLES_TO_INTERESTS = "articlesToInterests";

    //name of the articleSimilarities collection
    public static final String ARTICLE_SIMILARITIES = "articleSimilarities";

    public static final String INSTITUTION_INTERESTS ="institutionInterests";


    private String dbName = null;
    private String wpDbName = "fromWikipedia";

    LRUCache<Long, Set<Long>> interestUserCache = new LRUCache<Long, Set<Long>>(2000);
    LRUCache<Long, Set<Long>> interestRequestCache = new LRUCache<Long, Set<Long>>(2000);
    LRUCache<Long, Set<Long>> userInstitutionCache = new LRUCache<Long, Set<Long>>(2000);

    public MongoWrapper(Mongo mongo, String dbName, String wpDbName){
        this.mongo=mongo;
        this.dbName = dbName;
        this.wpDbName = wpDbName;
    }

    public void changeDB(String dbName) {
        this.dbName = dbName;
    }
    
    public DB getDb(){
        return mongo.getDB(dbName);
    }

    public DB getDb(boolean wpDb) {
        if (wpDb) {
            return mongo.getDB(wpDbName);
        } else {
            return mongo.getDB(dbName);
        }
    }


    public void copyDB(String fromDB, String dbName) {
        DB db = mongo.getDB( "admin" );
        //System.out.println("copying from '" + fromDB + "' to '" + dbName + "'");
        db.command("use " + fromDB);
        BasicDBObjectBuilder b = BasicDBObjectBuilder.start();
        b.append("copydb", 1);
        b.append("fromhost", "localhost");
        b.append("fromdb", fromDB);
        b.append("todb", dbName);
        CommandResult cmd = db.command(b.get());
        //CommandResult cmd2 = db.command(((String)("use "+dbName)));
    }

    public void dropDB(String dbName) {
        mongo.dropDatabase(dbName);
    }

    public void dropCurrentDB(){
        mongo.dropDatabase(dbName);
    }

    public void switchToCopyDB(String toCopy) {
        Random rand = new Random();
        String dbName = "tmp" + rand.nextInt(10000);
        copyDB(toCopy, dbName);
        changeDB(dbName);
    }

    public DBObject findById(String collection, Object id, boolean articleDb) throws IllegalArgumentException{
        return findByField(collection, "_id", id, articleDb);
    }

    public DBObject findByField(String collection, String field, Object value, boolean articleDb) throws IllegalArgumentException{
        DBObject searchById= new BasicDBObject(field, value);
        DBCollection coll = getDb(articleDb).getCollection(collection);
        //System.out.println("DBCollection: " + coll.toString());
        //for (DBObject o : coll.find()) {
            //System.out.println("DBObject in collection: " + o.toString());
        //}
        DBObject res = coll.findOne(searchById);
        if(res==null){
            throw new IllegalArgumentException("No record found in "+collection+" with " + field + " "+value.toString());
        }
        return res;
    }


    public DBObject safeFindByField(String collection, String field, Object value, boolean articleDb){
        try{
            return findByField(collection, field, value, articleDb);
        }   catch(IllegalArgumentException e){
            //System.out.println(e.getMessage());
            return null;
        }
    }


    public DBObject safeFindById(String collection, Object id, boolean articleDb){
        return safeFindByField(collection, "_id", id, articleDb);
    }

    public void addUser(Long userId, List<Long> userInterests, List<Long> institutionIds) throws RuntimeException {
        if(userId == null){
            throw new RuntimeException("User needs an ID");
        }
        if (institutionIds.size() < 1) {
            throw new RuntimeException("user needs at least one institutionId");
        } else {
            for (Long institutionId: institutionIds) {
                if(institutionId == null) {
                    throw new RuntimeException("users institution has no ID");
                }
            }
        }

        for (long i : userInterests) {
            addInterestToInstitutions(i, institutionIds);
        }
        DBObject newUser = new BasicDBObject("_id", userId);
        //log.info(interestIds+"addUser")
        newUser.put("interests", userInterests);
        newUser.put("institutions", institutionIds);
        DBObject searchById = safeFindById(USERS, userId, false);
        DBCollection users = getDb().getCollection(USERS);
        if(searchById != null){
            users.update(searchById, newUser);
        }
        else{
            users.insert(newUser);
        }
        //log.info("User ID: "+id)
        //log.info("Institution ID: "+institutionId)


        for (long i : userInterests) {
            interestUserCache.remove(i);
        }
        userInstitutionCache.remove(userId);
    }

    /**
     * Removes the user, keeping the appropriate institution's list
     * of interests up to date, and removing any interests that are
     * owned by no other people.
     * @param userId The Long id of the user to remove
     * @return A double List of longs. The first list is the list of
     * interests needing to be to removed from the database, the second
     * is the collaborator requests owned by the person, now in need
     * of deletion.
     */
    public List<List<Long>> removeUser(Long userId) {
        Set<Long> interests = getUserInterests(userId);
        List<Long> deletedInterests = new LinkedList<Long>();
        // Two lists. 1: list of interests to be deleted. 2: list of collaborator
        // requests owned by the person, also in need of deletion.
        List<List<Long>> delInterestCollaborator = new LinkedList<List<Long>>();
        // maps interest ids to the ids of all users with that interest
        HashMap<Long, Set<Long>> interestUsers = new HashMap<Long, Set<Long>>();
        // maps interest ids to the ids of all collaborator requests with that interest
        HashMap<Long, Set<Long>> interestRequests = new HashMap<Long, Set<Long>>();
        DBObject user = safeFindById(USERS, userId, false);
        if (user == null) {
            return delInterestCollaborator;
        }
        for (Long i : interests) {
            Set<Long> iUsers = getInterestUsers(i);
            iUsers.remove(userId);
            interestUsers.put(i, iUsers);
            interestRequests.put(i, getInterestRequests(i));
        }
        for (long instId : getUserInstitutions(userId)) {
             deletedInterests.addAll(handleDisconnects(interests, interestUsers, interestRequests, instId));
        }
        // finally, remove the user
        DBCollection users = getDb().getCollection(USERS);
        users.remove(user);
        delInterestCollaborator.add(deletedInterests);
        delInterestCollaborator.add(getUserRequests(userId));

        for (Long i : interests) {
            interestUserCache.remove(i);
        }
        userInstitutionCache.remove(userId);

        return delInterestCollaborator;
    }

    /**
     * Returns a set of longs giving all of the institution
     * ids that the user is a part of.
     * @param userId The long id of the user whose institutions
     * are to be returned.
     * @return A Set<Long> of ids for the user's institutions.
     */
    public Set<Long> getUserInstitutions(long userId){
        Set<Long> institutionIds = userInstitutionCache.get(userId);
        if (institutionIds == null) {
            institutionIds = new HashSet<Long>();
            DBObject user = safeFindById(USERS, userId, false);
            if (user == null) {
                LOG.fatal("no user associated with id '" + userId + "'");
            }
            if (user.get("institutions") == null) {
                LOG.fatal("no institutions associated with user '" + userId + "'");
            }
            for (Long id: (List<Long>)user.get("institutions")) {
                institutionIds.add(id);
            }
            userInstitutionCache.put(userId, institutionIds);
        }
        return institutionIds;
    }

    public Set<Long> getUserInterests(long id){
        DBObject user = safeFindById(USERS, id, false);
        Set<Long> interests = new HashSet<Long>();
        BasicDBList userInterests=(BasicDBList) user.get(INTERESTS);
        //interests.addAll((ArrayList<Long>)(ArrayList<Object>)userInterests);
        //interests.addAll(Arrays.asList((Long[]) userInterests.toArray()));
        for (Object l : userInterests) {
            interests.add((Long)l);
        }
        return interests;
    }

    /**
     * Constructs and returns a list of the ids of all
     * collaborator requests owned by the person with
     * the parameter id.
     * @param userId The long id of the user whose collaborator
     * requests are desired.
     * @return List of long id numbers of all collaborator
     * requests owned by the specified user.
     */
    public List<Long> getUserRequests(long userId) {
        List<Long> userRequests = new ArrayList<Long>();

        DBObject query = new BasicDBObject("creator",userId);
        DBCollection coll = getDb().getCollection(COLLABORATOR_REQUESTS);
        DBCursor res =coll.find(query);
        for(DBObject rfc: res){
            userRequests.add((Long)rfc.get("_id"));
        }
        return userRequests;
    }

    public Set<Long> getInterestUsers(long id) {
        Set<Long> res = interestUserCache.get(id);
        if (res != null) {
            return res;
        }
        res = new HashSet<Long>();
        DBObject query = new BasicDBObject("interests", id);
        DBObject keys = new BasicDBObject("_id", 1);
        DBCollection users = getDb(false).getCollection(USERS);
        DBCursor cursor = users.find(query, keys);
        for (DBObject user : cursor) {
            res.add((Long)user.get("_id"));
        }
        interestUserCache.put(id, res);
        return res;
    }

    public Set<Long> getInterestRequests(long id) {
        Set<Long> res = interestRequestCache.get(id);
        if (res != null) {
            return res;
        }
        res = new HashSet<Long>();
        DBObject query = new BasicDBObject("keywords", id);
        DBCollection requests = getDb(false).getCollection(COLLABORATOR_REQUESTS);
        DBCursor cursor = requests.find(query);
        for (DBObject request : cursor) {
            res.add((Long)request.get("_id"));
        }
        interestRequestCache.put(id, res);
        return res;
    }


    /**
     * Returns a set long ids corresponding to all institutions
     * who own the interest with parameter interestId
     * @param interestId The long id whose institutional presence
     * is desired.
     * @return A Set<Long> containing the ids of all institutions
     * that own the parameter interest.
     */
    public Set<Long> getInterestInstitutions(long interestId) {
        Set<Long> institutions = new HashSet<Long>();
        DBCollection allInstitutions = getDb().getCollection(INSTITUTION_INTERESTS);
        for (DBObject dbObject : allInstitutions.find()) {
            Set<Long> interests = interestStringToSet(dbObject.get("interests")+"");
            if (interests.contains(interestId)) {
                institutions.add((Long)dbObject.get("_id"));
            }
        }
        return institutions;
    }

    public void addCollaboratorRequest(long rfcId, List<Long> interests, long creatorId, List<Long> institutionIds) {
        DBObject newRFC = new BasicDBObject("_id", rfcId);
        //log.info(interestIds+"addCollaboratorRequest")
        for (long i : interests) {
            addInterestToInstitutions(i, institutionIds);
            interestRequestCache.remove(i);
        }
        newRFC.put("keywords", interests);
        newRFC.put("creator", creatorId);
        newRFC.put("institutions", institutionIds);
        DBCollection collaboratorRequests = getDb().getCollection(COLLABORATOR_REQUESTS);
        DBObject searchById = safeFindById(COLLABORATOR_REQUESTS, rfcId, false);
        if(searchById !=null){
            collaboratorRequests.update(searchById, newRFC);
        }
        else{
            collaboratorRequests.insert(newRFC);
        }
    }

    /**
     * Returns a set of longs giving all of the institution
     * ids that the request is a part of.
     * @param id The long id of the request whose institutions
     * are to be returned.
     * @return A Set<Long> of ids for the request's institutions.
     */
    public Set<Long> getCollaboratorRequestInstitutions(long id){
        DBObject rfc = safeFindById(COLLABORATOR_REQUESTS, id, false);
        Set<Long> institutionIds = new HashSet<Long>();
        if (rfc != null) {
            for (Long institutionId: (List<Long>) rfc.get("institutions")) {
                institutionIds.add(institutionId);
            }
        }
        return institutionIds;
    }

    public Long getCollaboratorRequestCreator(long id){
        DBObject rfc = safeFindById(COLLABORATOR_REQUESTS, id, false);
        System.out.println("RFC: " + rfc.toString());
        return (Long) rfc.get("creator");
    }

    public Set<Long> getRequestKeywords(long id){
        DBObject rfc = safeFindById(COLLABORATOR_REQUESTS, id, false);
        System.out.println("RFC: " + rfc.toString());
        Set<Long> keywords = new HashSet<Long>();
        for(Object l :(BasicDBList)rfc.get("keywords")){
            keywords.add((Long) l);
        }
        return keywords;
    }

    /**
     * Removes the collaborator request with the parameter id
     * number from the database.
     * @param id The long id, of the collaborator request to
     * be removed
     * @return List<Long> containing the ids of interests that
     * have been removed from mongo as a result of removing
     * this collaborator request.
     */
    public List<Long> removeCollaboratorRequest(long id) {
        Set<Long> interests = getRequestKeywords(id);
        List<Long> deletedInterests = new LinkedList<Long>();
        // maps interest ids to the ids of all users with that interest
        HashMap<Long, Set<Long>> interestUsers = new HashMap<Long, Set<Long>>();
        // maps interest ids to the ids of all collaborator requests with that interest
        HashMap<Long, Set<Long>> interestRequests = new HashMap<Long, Set<Long>>();
        DBObject request = safeFindById(COLLABORATOR_REQUESTS, id, false);
        if (request == null) {
            return deletedInterests;
        }
        for (Long i : interests) {
            interestUsers.put(i, getInterestUsers(i));
            Set<Long> iRequests = getInterestRequests(i);
            iRequests.remove(id);
            interestRequests.put(i, iRequests);
            interestRequestCache.remove(i);
        }
        for (long instId : getCollaboratorRequestInstitutions(id)) {
             deletedInterests.addAll(handleDisconnects(interests, interestUsers, interestRequests, instId));
        }
        // finally, remove the collaborator request
        DBCollection collaboratorRequests = getDb().getCollection(COLLABORATOR_REQUESTS);
        collaboratorRequests.remove(request);
        return deletedInterests;
    }

    /**
     * Add the interest with id secondId to the interest with id firstId's
     * list of similar interests, giving the relation a score of similarity.
     * @param firstId the interest to be added to
     * @param secondId the similar interest to be added
     * @param similarity the similarity between the interests
     */
    public void addToInterests(long firstId, long secondId, double similarity){
        //log.info("Similar Interest Id before added to DB: "+secondId)
        DBCollection interests = getDb().getCollection(INTERESTS);
        DBObject i = safeFindById(INTERESTS, firstId, false);
        if(i == null){
            i=new BasicDBObject("_id", firstId);
            interests.insert(i);
        }
        //log.info("Similar Interest String added to DB: "+interest)
        //log.info(similar+interest+" addToInterests put" )
        SimilarInterestList sim = new SimilarInterestList((String)i.get("similar"));
        sim.add(new SimilarInterest(secondId, similarity));
        i.put("similar",sim.toString());
        interests.update(safeFindById(INTERESTS, firstId, false),i);
    }

    /**
     * Removes the interest with the parameter interestId from
     * the database. This method assumes that the interest is
     * owned by no user, collaborator request, or institution.
     * @param interestId The Long id of the interest to remove
     */
    private void removeInterest(Long interestId) {
        DBObject interest = safeFindById(INTERESTS, interestId, false);
        if (interest == null) {
            return;
        }
        SimilarInterestList similarInterests = getSimilarInterests(interestId);
        for (SimilarInterest sim : similarInterests.list) {
            removeSimilarInterest(sim.interestId, interestId);    
        }
        DBCollection interests = getDb().getCollection(INTERESTS);
        interests.remove(interest);
    }


    /**
     * Removes the specified interest from the user's interests
     * @param interestId The Long id of the interest to remove
     * @param userId The Long id of the user to remove the interest from
     * @return true if the interest was completely removed removed from
     * the database, false otherwise
     */
    public boolean removeInterestFromUser(Long interestId, Long userId) {
        DBObject user = safeFindById(USERS, userId, false);
        if (user == null) {
            return false;
        }
        Set<Long> institutions = getInterestInstitutions(interestId);
        Set<Long> interestUsers = getInterestUsers(interestId);
        Set<Long> interestRequests = getInterestRequests(interestId);
        interestUsers.remove(userId);
        for (Long u : interestUsers) {
            institutions.removeAll(getUserInstitutions(u));
        }
        for (Long request : interestRequests) {
            institutions.removeAll(getCollaboratorRequestInstitutions(request));
        }
        for (Long institution : institutions) {
            removeInterestFromInstitution(interestId, institution);
        }
        List<Long> interests = (List<Long>)user.get("interests");
        interests.remove(interestId);
        user.put("interests", interests);
        DBCollection users = getDb().getCollection(USERS);
        users.update(safeFindById(USERS, userId, false), user);
        if (interestIsDisconnected(interestId)) {
            removeInterest(interestId);
            return true;
        }
        return false;
    }

    /**
     * Removes the specified keyword from the request keywords
     * @param keywordId The Long id of the keyword to remove
     * @param requestId The Long id of the request to remove the interest from
     * @return true if the keyword/interest was completely removed from the
     * database, false otherwise
     */
    public boolean removeKeywordFromRequest(Long keywordId, Long requestId) {
        DBObject request = safeFindById(COLLABORATOR_REQUESTS, requestId, false);
        if (request == null) {
            return false;
        }
        Set<Long> institutions = getInterestInstitutions(keywordId);
        Set<Long> interestUsers = getInterestUsers(keywordId);
        Set<Long> interestRequests = getInterestRequests(keywordId);
        interestRequests.remove(requestId);
        for (Long u : interestUsers) {
            institutions.removeAll(getUserInstitutions(u));
        }
        for (Long r : interestRequests) {
            institutions.removeAll(getCollaboratorRequestInstitutions(r));
        }
        for (Long institution : institutions) {
            removeInterestFromInstitution(keywordId, institution);
        }
        List<Object> keywords = (List<Object>)request.get("keywords");
        keywords.remove(keywordId);
        request.put("keywords", keywords);
        DBCollection requests = getDb().getCollection(COLLABORATOR_REQUESTS);
        requests.update(safeFindById(COLLABORATOR_REQUESTS, requestId, false), request);
        if (interestIsDisconnected(keywordId)) {
            removeInterest(keywordId);
            return true;
        }
        return false;
    }

   /**
    * Remove the parameter secondInterest from the firstInterest's
    * list of similar intersts.
    * @param firstInterest the interest to be removed from
    * @param secondInterest the similar interest to be removed
    */
    public void removeSimilarInterest(Long firstInterest, Long secondInterest){
        DBCollection interests = getDb().getCollection(INTERESTS);
        DBObject i = safeFindById(INTERESTS, firstInterest, false);
        if (i != null) {
            SimilarInterestList similarInterests = new SimilarInterestList((String)i.get("similar"));
            similarInterests.remove(new SimilarInterest(secondInterest, (double)0));
            i.put("similar", similarInterests.toString());
            interests.update(safeFindById(INTERESTS, firstInterest, false),i);
        }
    }

    /**
     * Checks if the interest with the parameter id is
     * not owned by any user or collaborator request.
     * @param interestId The long id of the interest to check
     * @return true if the interest is disconncected, false
     * otherwise.
     */
    private boolean interestIsDisconnected(long interestId) {
        return ((getInterestUsers(interestId).size() == 0) && (getInterestRequests(interestId).size() == 0));
    }

    /**
     * Removes all orphaned interests from the database.
     * @return List<Long> ids of the reaped orphans
     */
    public List<Long> reapOrphans() {
        System.out.println("Witness the reaping");
        DBCollection interests = getDb().getCollection(INTERESTS);
        List<Long> theReaped = new ArrayList<Long>();
        for (DBObject dbObject : interests.find()) {
            long id = (Long)(dbObject.get("_id"));
            Set<Long> institutions = getInterestInstitutions(id);
            for (Long u : getInterestUsers(id)) {
                institutions.removeAll(getUserInstitutions(u));
            }
            for (Long r : getInterestRequests(id)) {
                institutions.removeAll(getCollaboratorRequestInstitutions(r));
            }
            for (Long institution : institutions) {
                System.out.println("Interest id: " + id + " text: " + dbObject.get("text") + " removed from institution " + institution);
                removeInterestFromInstitution(id, institution);
            }
            if (interestIsDisconnected(id)) {
                System.out.println("Interest id: " + id + " text: " + dbObject.get("text") + " removed from database");
                removeInterest(id);
                theReaped.add(id);
            }
        }
        return theReaped;
    }

    public long articleToId(String title){
        DBObject res = safeFindById(ARTICLES_TO_IDS, title, true);
        if(res == null){
            System.out.println("Invalid article title no ID found");
            return (long) -1;
        }
        Object wpId = res.get("wpId");
        if (wpId instanceof Integer) {
            return ((Integer)wpId).longValue();
        } else if (wpId instanceof String) {
            return Long.valueOf((String)wpId);
        } else if (wpId instanceof Long) {
            return (Long) wpId;
        } else {
            throw new IllegalStateException("invalid article id: '" + wpId + "'");
        }
    }

    public void buildInterestRelations (String text, long interest, long article, boolean relationsBuilt) {
        SimilarInterestList articles = getArticleSimilarities(article);
        SimilarInterestList list = new SimilarInterestList();
        int i = 0;
        Map<Long, Double> ids = new HashMap<Long, Double>();
        while (list.size() < 200 && i < articles.size()) {
            SimilarInterest check = articles.get(i);
            DBObject articleToInterests = safeFindById(ARTICLES_TO_INTERESTS, check.interestId, false);
            if (articleToInterests != null) {
                Set<Long> similarInterests = interestStringToSet((String)articleToInterests.get("interests"));
                for (long id : similarInterests) {
                    if (relationsBuilt && id!=interest) {
                        ids.put(id, check.similarity);
                    }
                    if(id!=interest){
                        list.add(new SimilarInterest(id, check.similarity));
                    }
                }
            }
            i++;
        }

        // Create a stub record with the text
        DBObject dbo = safeFindById(INTERESTS, interest, false);
        if(dbo == null) {
            dbo =  new BasicDBObject("_id", interest);
            dbo.put("similar", "");
        }
        if (dbo.get("text") == null || dbo.get("text") != text) {
            dbo.put("text", text);
            getDb().getCollection(INTERESTS).save(dbo);
        }


        addInterestRelations(interest, list, false);
        if (relationsBuilt) {
            for (long id : ids.keySet()) {
                SimilarInterestList sims = new SimilarInterestList();
                sims.add(new SimilarInterest(interest, ids.get(id)));
                addInterestRelations(id, sims, true);
            }
        }
    }

    public void cleanupInterestRelations(Set<Long> validIds) {
        DBCollection interests = getDb().getCollection(INTERESTS);
        for (DBObject entry : interests.find()) {
            String simStr = (String)entry.get("similar");
            if (simStr != null) {
                Long id = (Long) entry.get("_id");
                DBObject q = new BasicDBObject("_id", id);
                if (validIds.contains(id)) {
                    SimilarInterestList sims = new SimilarInterestList(simStr);
                    sims.dedupe(validIds);
                    entry.put("similar", sims.toString());
                    interests.update(q, entry);
                } else {
                    interests.remove(q);
                }
            }
        }
    }

    public void cleanupPeople(Set<Long> validIds){
        DBCollection people = getDb().getCollection(USERS);
        System.out.println(people.find());
        for (DBObject entry : people.find()){
            if (!validIds.contains(entry.get("_id"))){
                people.remove(entry);
            }
        }
    }

    public void cleanupCollaboratorRequests(Set<Long> validIds){
        DBCollection requests = getDb().getCollection(COLLABORATOR_REQUESTS);
        System.out.println(requests.find());
        for (DBObject entry : requests.find()){
            if (!validIds.contains(entry.get("_id"))){
                requests.remove(entry);
            }
        }
    }


    public void addInterestRelations(long interestId, SimilarInterestList sims, boolean merge){
        DBCollection interests = getDb().getCollection(INTERESTS);
        DBObject interest= safeFindById(INTERESTS, interestId, false);
        if(interest == null){
            interest = new BasicDBObject("_id", interestId);
            interest.put("similar", "");
            interests.insert(interest);
        }
        if (merge) {
            sims.add((String)interest.get("similar"));
        }
        interest.put("similar", sims.toString());
        interests.update(safeFindById(INTERESTS, interestId, false), interest);
    }

    public SimilarInterestList getSimilarInterests(long interest){
        //System.out.println(interest + " was the interest");
        DBObject i = safeFindById(INTERESTS, interest, false);
        if (i == null) {
            System.out.println("The interest " + interest + " is null");
            return new SimilarInterestList();
        }
        //System.out.println(i +" getSimilarInterests get");
        String res = (String)i.get("similar");
        if (res == null) {
            return new SimilarInterestList();
        }
        return new SimilarInterestList(res);
    }

    public SimilarInterestList getSimilarInterests(Long interest, Set<Long> institutionFilter) {
        DBObject i = safeFindById(INTERESTS, interest, false);
        if (i == null) {
            return new SimilarInterestList();
        }
        //log.info(similar +" getSimilarInterests get")
        Set<Long> institutionInterests = new HashSet<Long>();
        for (long id : institutionFilter) {
            institutionInterests.addAll(getInstitutionInterests(id));
        }
        return new SimilarInterestList((String)i.get("similar"), institutionInterests);
    }

    public void removeLowestSimilarity(Long interest) {
        DBCollection interests = getDb().getCollection(INTERESTS);
        DBObject i = safeFindById(INTERESTS, interest, false);
        SimilarInterestList similarInterests = new SimilarInterestList((String)i.get("similar"));
        similarInterests.removeLowest();
        i.put("similar", similarInterests.toString());
        interests.update(safeFindById(INTERESTS, interest, false),i);
    }


   /**
    *
    * @param interest the interest to replace lowest similarity in
    * @param newInterest the new similar interest
    * @param similarity the new similarity
    */
    public void replaceLowestSimilarity(Long interest, Long newInterest, Double similarity){
        DBCollection interests = getDb().getCollection(INTERESTS);
        DBObject i = safeFindById(INTERESTS, interest, false);
        SimilarInterestList similarInterests = new SimilarInterestList((String)i.get("similar"));
        similarInterests.add(new SimilarInterest(newInterest, similarity));
        similarInterests.removeLowest();
        i.put("similar", similarInterests.toString());
        interests.update(safeFindById(INTERESTS, interest, false),i);
    }

    private void addInterestToInstitutions(long interestId, List<Long> institutionIds) {
        for (long institutionId: institutionIds) {
            addInterestToInstitution(interestId, institutionId);
        }
    }

    private void addInterestToInstitution(long interestId ,long institutionId) {
        DBObject institution = safeFindById(INSTITUTION_INTERESTS, institutionId, false);
        DBCollection institutionInterests = getDb().getCollection(INSTITUTION_INTERESTS);
        if(institution==null) {
            institution = new BasicDBObject("_id", institutionId);
            institution.put("interests","");
            institutionInterests.insert(institution);
        }
        String res = interestSetToString(interestStringToSet(institution.get("interests")+
                Long.toString(interestId)+","));
        institution.put("interests",res);
        institutionInterests.update(safeFindById(INSTITUTION_INTERESTS, institutionId, false),institution);
    }

    /**
     * Removes an interest from the specified institution
     * @param interest The id of the interest to remove
     * @param institutionId The id of the institution to remove the
     * interest from
     */
    private void removeInterestFromInstitution(Long interest, Long institutionId) {
        DBObject institution = safeFindById(INSTITUTION_INTERESTS, institutionId, false);
        if (institution == null) {
            return;
        }
        DBCollection institutionInterests = getDb().getCollection(INSTITUTION_INTERESTS);
        Set<Long> updateInterests = interestStringToSet(institution.get("interests")+"");
        updateInterests.remove(interest);

        String res = interestSetToString(updateInterests);
        institution.put("interests",res);
        institutionInterests.update(safeFindById(INSTITUTION_INTERESTS, institutionId, false),institution);
    }

    public Set<Long> getInstitutionInterests(long id) {
        DBObject institution = safeFindById(INSTITUTION_INTERESTS, id, false);
        if(institution == null) {
            return new HashSet<Long>();
        }
        return interestStringToSet((String)institution.get("interests"));
    }

    private String interestSetToString(Set<Long> interests) {
        String res = "";
        for (Long i : interests) {
            res = res + i.toString() + ",";
        }
        return res;
    }

    private Set<Long> interestStringToSet(String interestString) {
        Set<Long> res = new HashSet<Long>();
        String[] interests = interestString.split(",");
        for (String i : interests) {
            if (i.length() > 0) {
                res.add(Long.parseLong(i));
            }
        }
        return res;
    }

    public SimilarInterestList getArticleSimilarities(long article) {
        DBObject similarities = safeFindById(ARTICLE_SIMILARITIES, "" + article, true);
        if (similarities == null) {
            System.out.println(article + " does not have an articleSimilarities entry");
            return new SimilarInterestList();
        }
        //System.out.println(article);
        //really long print ln statement below
        //System.out.println(similarities.toString());
        return new SimilarInterestList((String)similarities.get("similarities"));
    }

    public void addInterestToArticle(long interest, long article){
        DBObject articleInterests = safeFindById(ARTICLES_TO_INTERESTS , article, false);
        DBCollection articlesToInterests = getDb().getCollection(ARTICLES_TO_INTERESTS);
        if(articleInterests==null){
            articleInterests=new BasicDBObject("_id", article);
            articleInterests.put("interests","");
            articlesToInterests.insert(articleInterests);
        }
        Set<Long> interests = interestStringToSet((String)articleInterests.get("interests"));
        interests.add(interest);
        articleInterests.put("interests", interestSetToString(interests));
        articlesToInterests.update(safeFindById(ARTICLES_TO_INTERESTS, article, false), articleInterests);

    }

  
    /**
     * For use when removing a user or collaborator request. Handles any
     * disconnects.  Should no other user or request from the specified
     * institution own an interest, removes the interest from that
     * institution's list of owned interests. Should no other user or
     * request own an interest, removes the interest from the database.
     *
     * @param interests Set of interest ids to check for disconnects.
     * @param interestUsers Maps interestIds (same ids as in the interests) to
     * the users with that interest. Should the deletion be caused by
     * the removal of a user, then the user being removed should not be
     * present in this Map.
     * @param interestRequests Map of all ids in the interests set to
     * the requests with that interest. Should the deletion be caused by
     * the removal of a request, then the request being removed should
     * not be present in this Map.
     * @param institutionId Set<Long> ids of the institutions to check and
     * update should the removal of an interest require the institution
     * to update its list of owned interests.
     * @return A List<Long> of the interests that were completely removed
     * from the database as a result of this remove.
     */
    private List<Long> handleDisconnects(Set<Long> interests, Map<Long,Set<Long>> interestUsers, Map<Long,Set<Long>> interestRequests, Long institutionId) {
        List<Long> deletedInterests = new LinkedList<Long>();
        for (Long interestId : interestUsers.keySet()) {
            boolean removed = false;
            if (interestUsers.get(interestId).size() == 0) {
                if (interestRequests.get(interestId).size() == 0) {
                    // interest is owned by no one, delete it
                    removeInterest(interestId);
                    deletedInterests.add(interestId);
                }
            }
            // weed out interests owned by others in the institutions
            for (Long u : interestUsers.get(interestId)) {
                if (getUserInstitutions(u).contains(institutionId)) {
                    interests.remove(interestId);
                    removed = true;
                    break;
                }
            }
            if (!removed) {
                for (Long c : interestRequests.get(interestId)) {
                    if (getCollaboratorRequestInstitutions(c).contains(institutionId)) {
                        interests.remove(interestId);
                        break;
                    }
                }
            }
        }
        // interests holds interests to remove from institution
        for (Long i : interests) {
            removeInterestFromInstitution(i, institutionId);
        }
        return deletedInterests;
    }

    public void extractSmallWpDb(String destinationDb) {
        mongo.dropDatabase(destinationDb);
        DB dbDest = mongo.getDB(destinationDb);

        DBCollection articlesToInterests = getDb().getCollection(ARTICLES_TO_INTERESTS);
        DBCollection articlesToIdsDest = dbDest.getCollection(ARTICLES_TO_IDS);
        DBCollection articleSimsDest = dbDest.getCollection(ARTICLE_SIMILARITIES);

        int total = 0;
        int found = 0;
        for (DBObject entry : articlesToInterests.find()) {
            total += 1;
            String article = "" + entry.get("_id");
            DBObject articleIds = safeFindByField(ARTICLES_TO_IDS, "wpId", article, true);
            if (articleIds == null) {
                continue;
            }
            articlesToIdsDest.insert(articleIds);
            DBObject sims = safeFindById(ARTICLE_SIMILARITIES, article, true);
            if (sims == null) {
                continue;
            }
            articleSimsDest.insert(sims);
            found++;
        }

        articlesToIdsDest.ensureIndex("wpId");
        System.err.println("copied " + found + " of " + total);
    }

    /**
     * Clears all caches
     */
    public void clearCache(){
        interestUserCache.clear();
        interestRequestCache.clear();
        userInstitutionCache.clear();
    }



}
