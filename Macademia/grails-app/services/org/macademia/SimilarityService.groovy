package org.macademia

import org.codehaus.groovy.grails.commons.ConfigurationHolder

class SimilarityService {

    // The maximum number of similar interests per interest
    int numSimsPerInterest = 8

    // The maximum number of similar interests per neighbors
    int numSimsPerNeighbor = 10

    // The minimum number of similar interests per interest
    int minSimsPerInterest = 2

    // The maximum number of times to use a particular interest as a partner for other interests
    int maxSimsPerInterest = 30

    // Only similarities in the top fraction are used to fill out interests
    double refinedThreshold = ConfigurationHolder.config.refinedThreshold

    // The lowest possible acceptable similarity score
    double absoluteThreshold = ConfigurationHolder.config.absoluteThreshold

    //Has buildInterestRelations() been run?
    boolean relationsBuilt = true

    boolean transactional = true


    def databaseService
    def sessionFactory

   public void buildInterestRelations() {
        for (Interest interest : Interest.findAll()) {
//            log.info("interest Id is $interest.id related article is $interest.articleId and relations Built is $relationsBuilt")
            if(!(interest.articleId==null || interest.articleId<0)){
                databaseService.buildInterestRelations(interest.normalizedText, interest.id, interest.articleId, relationsBuilt)
            }  else{
                log.info("Interest $interest has no related article")
            }
        }
        relationsBuilt = true
    }


    public void cleanupInterestRelations() {
        Set<Long> validIds = new HashSet<Long>(Interest.list().collect({it.id}))
        databaseService.cleanupInterestRelations(validIds)
    }

   /**
    *
    * @param i
    */
    public void buildInterestRelations(Interest interest){
        if ((interest.articleId != null) && (interest.articleId > 0)) {
            databaseService.buildInterestRelations(interest.normalizedText, interest.id, interest.articleId, relationsBuilt)
        } else {
            log.info("Interest $interest has no related article")
        }
    }

    /**
     * Finds the local graph given an interest to go at the center and a maximum number of people
     * to go in the graph.
     *
     * @param interest the interest to go at the center of the graph
     * @param maxPeople the maximum number of people to go in the graph
     * @param maxInterests the maximum number of interests to go in the graph
     * @return A graph that contains the nodes and edges to them of the neighbor of the passed interest
     */
    public Graph calculateInterestNeighbors(Interest interest, int maxPeople, int maxInterests){
        return calculateInterestNeighbors(interest, maxPeople, maxInterests, null)
    }

    /**
     * Constructs an interest centric graph.  First adds all people and requests who own the central
     * interest, then adds similar interests and people who own those similar interests.
     * @param interest The central interest of the graph
     * @param maxPeople The maximum number of people to add to the graph
     * @param maxInterests The maximum number of interests to add to the graph
     * @param institutionFilter
     * @return The completed graph
     */
    public Graph calculateInterestNeighbors(Interest interest, int maxPeople, int maxInterests, Set<Long> institutionFilter){
        Graph graph = new Graph()
        //interestCache = new HashMap<Long, Interest>()
        graph = findPeopleAndRequests(graph, maxPeople, interest.id, null, 1, institutionFilter)
        for(SimilarInterest ir : getSimilarInterests(interest.id, maxInterests, absoluteThreshold, institutionFilter)){
            //log.info("Similar interest ID: "+ir.interestId+" similarity score "+ir.similarity)
            if (graph.getInterests().size() < maxInterests + 1) {
                graph.addEdge(null, interest.id, ir.interestId, null, ir.similarity)
                graph = findPeopleAndRequests(graph, maxPeople, ir.interestId, null, ir.similarity, institutionFilter)
            }
        }
        graph.finalizeGraph(maxPeople)
        //interestCache = new HashMap<Long, Interest>()
        return graph
    }

    /**
     * Finds the local graph given a person to go at the center and a maximum number of people
     * to go in the graph.
     * @param person the person at the center of the graph
     * @param maxPeople the maximum number of people in the graph
     * @return A graph that contains the nodes and edges to them of the neighbor of the passed person
     */
    public Graph calculatePersonNeighbors(Person person, int maxPeople) {
        return calculatePersonNeighbors(person, maxPeople, null)
    }



     /**
      * Constructs a person centric graph.  Loops over the central person's interests,
      * calculating the neighbors of each interest.
      * @param person The central person of the graph
      * @param maxPeople The max number of people to be added to the graph
      * @param institutionFilter
      * @return The completed graph
      */
    TimingAnalysis timing = new TimingAnalysis("calc-person-neighbors")
    public Graph calculatePersonNeighbors( Person person, int maxPeople, Set<Long> institutionFilter){
//        timing = new TimingAnalysis()
        timing.recordTime("calc neighbors 1")
        Graph graph= new Graph(person.id)
        long graphStart = Calendar.getInstance().getTimeInMillis()
        //Bonus points for being the graph center
        def interests = databaseService.getUserInterests(person.id)
        timing.recordTime("calc neighbors 2")
        for(long i : interests){
            //For each interest owned by the central person, calculate neighbors
            graph = calculateNeighbors(i, graph, maxPeople, (Set<Long>)person.interests.collect({it.id}), institutionFilter)
        }
        timing.recordTime("calc neighbors 3")
        graph.finalizeGraph(maxPeople)
        timing.recordTime("calc neighbors 4")

        //println("person map is ${graph.personMap}")
        long graphEnd =Calendar.getInstance().getTimeInMillis()
        long graphTime=graphEnd-graphStart
        log.info("It took $graphTime to build $person graph")
        timing.recordTime("calc neighbors 5")
//        timing.analyze()
//        timing2.analyze()
//        timing3.analyze()

//        println("neighbor sizes are ${graph.personMap.size()} and ${graph.interestMap.size()}")
        return graph
    }


   /**
    * Should we link requests to other requests?
    *
    * Finds the local graph given a collaboration request to go at the center and a maximum number of
    * people to go in the graph
    * @param request   the collaborator request that goes at the center
    * @param maxPeople the maximum number of people to go in the graph
    * @return the local graph centered at the input CollaboratorRequest
    */
    public Graph calculateRequestNeighbors(CollaboratorRequest request, int maxPeople) {
        return calculateRequestNeighbors(request, maxPeople, null)
    }

    /**
     * Constructs a collaborator request centric graph. Loops over the central collaborator
     * request's interests, calculating the neighbors of each interest
     * @param request The central collaborator request of the graph
     * @param maxPeople The maximum number of people to add to the graph
     * @param institutionFilter
     * @return The completed graph
     */
    public Graph calculateRequestNeighbors(CollaboratorRequest request, int maxPeople, Set<Long> institutionFilter) {
        Graph graph = new Graph()
        for (long i : databaseService.getRequestKeywords(request.id)) {

            //For each interest owned by the collaborator request, calculate neighbors
            graph = calculateNeighbors(i, graph, maxPeople, (Set<Long>)request.keywords.collect({it.id}), institutionFilter)
        }
        graph.finalizeGraph(maxPeople)
        return graph
    }


   /**
    * Finds the branches off of an interest node in a graph centered on a request or a person.
    * @param i Id of the interest to calculate neighbors for
    * @param graph The graph to add the resultant edges to
    * @param maxPeople The maximum number of people who should be added to the graph
    * @param inner the interests that should be on the inner ring
    * @param institutionFilter
    * @return The graph with all conections to Interest i added
    */
    TimingAnalysis timing2 = new TimingAnalysis("calc neighbors")
    public Graph calculateNeighbors(Long i, Graph graph, int maxPeople, Set<Long> inner, Set<Long> institutionFilter) {
        if(i == null){
            return graph
        }
//        timing2.recordTime("calc neighbors 1")
        //Add all edges linked to Interest i
        graph = findPeopleAndRequests(graph, maxPeople, i, null, 1, institutionFilter)
//        timing2.recordTime("calc neighbors 2")
        def simInterests = getSimilarInterests(i, maxSimsPerInterest, absoluteThreshold, institutionFilter)
//        timing2.recordTime("calc neighbors 3")
        for(SimilarInterest ir : simInterests){
            //log.info("Similar interest ID: "+ir.interestId+" similarity score "+ir.similarity+"calculate neighbors")
            if(ir.interestId!=null){
                if(inner.contains(ir.interestId)) {
                    graph.addIntraInterestSim(i, ir.interestId, ir.similarity)
                } else {
                    //Add all edges linked to SimilarInterest ir
                    graph = findPeopleAndRequests(graph, maxPeople, i, ir.interestId, ir.similarity, institutionFilter)
                }
            }

        }
//        timing2.recordTime("calc neighbors 4")
        return graph
    }

    /**
     * Adds edges to the parameter graph between an Interest or SimilarInterest and all people who own
     * that Interest or SimilarInterest.
     * @param graph The graph to be modified
     * @param maxPeople The maximum number of people to add to the graph
     * @param i Id number of an Interest whose connections need to be added to the graph
     * @param ir Id number of a SimilarInterest whose connections need to added to the graph
     * @param sim The similarity score between i and ir. If ir is null, sim should be 1
     * @param institutionFilter
     * @return The graph with all appropriate edges added.
     */
    public static TimingAnalysis timing3 = new TimingAnalysis("find people and requests")
    public Graph findPeopleAndRequests(Graph graph, int maxPeople, Long i, Long ir, Double sim, Set<Long> institutionFilter) {
//        timing3.startTime()
        Long interestId
        if (ir == null) {
            interestId = i
        } else {
            interestId = ir
        }
        def userIds = databaseService.getInterestUsers(interestId)
//        timing3.recordTime("1")
//        timing.recordTime("find People And Requests getInterestUseres")
        for(long p : userIds){
            //For each person with the Interest or SimilarInterest
//            timing.startTime()
            if (institutionFilter == null) {
                graph.incrementPersonScore(p, i, interestId, sim)
                graph.addEdge(p, i, ir, null, sim)
            } else {
                for (Long perInst : databaseService.getUserInstitutions(p)) {
                    if (institutionFilter.contains(perInst)) {
                        graph.incrementPersonScore(p, i, interestId, sim)
                        graph.addEdge(p, i, ir, null, sim)
                        break
                    }
                }
            }
        }
//        timing3.recordTime("2")
        def requests = databaseService.getInterestRequests(interestId)
//        timing3.recordTime("3")
        for (long cr : requests) {
            //For each CollaboratorRequest with the Interest or SimilarInterest
            if (institutionFilter == null) {
                graph.addEdge(null, i, ir, cr, sim)
            } else {
                for (Long crInst : databaseService.getCollaboratorRequestInstitutions(cr)) {
                    if (institutionFilter.contains(crInst)) {
                        graph.addEdge(null, i, ir, cr, sim)
                        break
                    }
                }
            }
        }
//        timing3.recordTime("4")

        return graph
    }


    /*
     * Returns a list of similar interests in the form of interest relations.
     * The first interest in every interest relation will be the interest requested.
     * The second will be the similar interest.
     * The list is sorted by similarity in descending.  The size of the list depends
     * upon the relative threshold defined inside, as well as the roughThreshold variable.
     *
     * @param i the interest for which similar interests are being obtained
     *
     */
    public SimilarInterestList getSimilarInterests(Interest i) {
        return getSimilarInterests(i.id, maxSimsPerInterest, absoluteThreshold, null);
    }

    public SimilarInterestList getSimilarInterests(Interest i, Set<Long> institutionFilter) {
        return getSimilarInterests(i.id, maxSimsPerInterest, absoluteThreshold, institutionFilter)
    }

    public SimilarInterestList getSimilarInterests(Interest i , int max , double similarityThreshold) {
        return getSimilarInterests(i.id, max, similarityThreshold, null)
    }

    public SimilarInterestList getSimilarInterests(Long i , int max , double similarityThreshold) {
        return getSimilarInterests(i, max, similarityThreshold, null)
    }

    public SimilarInterestList getSimilarInterests(Long i , int max , double similarityThreshold, Set<Long> institutionFilter) {
        SimilarInterestList sims
        if (institutionFilter == null) {
            sims=databaseService.getSimilarInterests(i)
        } else {
            sims=databaseService.getSimilarInterests(i, institutionFilter)
        }
        if (sims.size() == 0) {
            return sims
        }
        int j = 0
        if (sims.get(0).similarity < similarityThreshold) {
            return new SimilarInterestList()
        }
        while (j < max && j < sims.size()) {
            if (sims.get(j).similarity > similarityThreshold) {
                j++
            } else {
                break
            }
        }
        return sims.getSublistTo(j)
    }

    public void analyzeTimes() {
        timing.analyze()
    }

}
