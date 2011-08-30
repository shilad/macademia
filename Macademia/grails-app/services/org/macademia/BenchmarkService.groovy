package org.macademia

class BenchmarkService {

    static transactional = true

    static int NUM_ITERATIONS = 200 //number of iterations
    static int NUM_PEOPLE = 1000  //number of people in the benchmark database
    static int NUM_INTERESTS = 6034 //number of interests (must be actual number of unique interests)
    static int MAX_PEOPLE = 25 //represents maximum number of people on the outside of a graph
    static int GORM_CLEAN_LINES = 225 //number of lines read before Gorm clean up is called
    Random rand = new Random()

    String personRes;
    String personFilterRes;
    String interestRes;
    String interestFilterRes;

    def similarityService
    def adminsService
    def institutionService
    def personService
    def interestService
    def nimbleService
    def sessionFactory
    def propertyInstanceMap = org.codehaus.groovy.grails.plugins.DomainClassGrailsPlugin.PROPERTY_INSTANCE_MAP

   /* def BenchmarkService() {
        populate(new File("db/benchmark_backup/people.txt"))
        benchmark()
    }  */

    def populate(File directory, boolean necessary) {
        Calendar build = Calendar.getInstance()
        long start = build.getTimeInMillis()
        interestService.initBuildDocuments("db/benchmark_backup/")
        readInstitutions(new File("db/prod/institutions.txt"))
        readPeople(new File(directory.toString()))
        int i = 0
        List<Long> interests= Interest.findAll().collect {it.id}
        //similarityService.roughThreshold=0.03
        //similarityService.refinedThreshold=0.01
        if (necessary) {
            similarityService.buildInterestRelations()
        }
        long end = build.getTimeInMillis()
        long time = (end - start) / 1000
        log.info("It took $time seconds to build the graph.")
    }

    def readInstitutions(File file) {
        log.error("reading intstitutions from $file...")
        file.eachLine {
            String line ->
            String[] tokens = line.trim().split("\t")
            if (tokens.length != 2) {
                log.error("illegal line in ${file.absolutePath}: ${line.trim()}")
                log.error("$tokens.length")
                return
            }
            String name = tokens[0]
            String emailDomain = tokens[1]
            if (institutionService.findByEmailDomain(emailDomain) == null) {
                Institution institution = new Institution(name : name, emailDomain : emailDomain)
                Utils.safeSave(institution)
            }
        }
    }

    def buildDocuments() {
        for (Interest i : Interest.findAll()) {
            interestService.buildDocuments(i)
        }
    }

    def readPeople(File file) {
        nimbleService.init()
        log.error("reading people from $file...")
        int i = 0
        file.eachLine {
            String line ->
            String[] tokens = line.trim().split("\t")
            if (tokens.length != 4) {
                log.error("illegal line in ${file.absolutePath}: ${line.trim()}")
                return
            }
            String name = tokens[0]
            String email = tokens[1]
            String dept = tokens[2]
            String interestStr = tokens[3]
            //String institutionName = tokens[4]

            Institution institution = institutionService.findByEmailDomain(email.split("@")[1])
            if (institution == null) {
                log.error("unknown institution in ${file.absolutePath}: ${line.trim()}")
                return
            }
            Person person = Person.findByEmail(email)
            if (person == null) {
                person = new Person(fullName: name, department: dept, email: email, institutions: [institution])
            }
            Interest interest = interestService.findByText(interestStr)
            if (interest == null) {
                interest = new Interest(interestStr)
                //Utils.safeSave(interest)
            }
            person.addToInterests(interest)
            if (person.id) {
                personService.save(person)
            } else {
                personService.create(person, 'useR123!', null)
            }
            
            i++
            if (i % 50 == 0) {
                cleanUpGorm()
                log.info("Cleaning GORM")
            }
        }
        log.error("Read ${Person.count()} people objects")
        log.error("Read ${Interest.count()} interest objects")

        //def admins = Role.findByName(AdminsService.ADMIN_ROLE)
        //adminsService.add(Person.findById(1).owner)
    }

    def benchmark() {
//        benchRand()
        benchmarkPersonGraph()
        benchmarkInterestGraph()
        benchmarkInstitutionFilterPersonGraph()
        benchmarkInstitutionFilterInterestGraph()
        log.info(personRes)
        log.info(interestRes)
        log.info(personFilterRes)
        log.info(interestFilterRes)
        similarityService.analyzeTimes()
    }

    def benchmarkPersonGraph() {
        log.info("Beginning person graph benchmark")
        Calendar cal = Calendar.getInstance()
        long begin = cal.getTimeInMillis()
        long randTime = 0
        long interests = 0
        List<Person> people = Person.findAll()

        for(int i = 0; i < NUM_ITERATIONS; i++) {
            long randStart = Calendar.getInstance().getTimeInMillis()
            Person person = people.get(rand.nextInt(NUM_PEOPLE))
            long randEnd = Calendar.getInstance().getTimeInMillis()
            log.info("RandTime: " + (randEnd - randStart))
            randTime = randTime + randEnd - randStart
            if(person != null){
                long interestSize = person.interests.size()
                log.info("Building graph $i for person $person with " + interestSize + " interests.")
                interests = interests + interestSize
                similarityService.calculatePersonNeighbors(person, MAX_PEOPLE)
            } else{
                i--
            }


        }
        cal = cal.getInstance()
        long end = cal.getTimeInMillis()

        int avg = ((int)(end - begin - randTime))
        avg=avg/NUM_ITERATIONS

        int intAvg = (end - begin - randTime)/interests

        log.info("Began: $begin")
        log.info("Ended: $end")
        personRes = "Over $NUM_ITERATIONS iterations, it took an average of $avg milliseconds to create" +
             " a graph with a random person at the center \n Over $interests interests, it took an average " +
                "of $intAvg milliseconds to create a graph for that interest"
        log.info(personRes)
    }

    def benchmarkInterestGraph() {
        log.info("Beginning interest graph benchmark")
        Calendar cal = Calendar.getInstance()
        long begin = cal.getTimeInMillis()
        long randTime = 0
        List<Interest> interests= Interest.findAll()

        for(int i = 0; i < NUM_ITERATIONS; i++) {
            long randStart = Calendar.getInstance().getTimeInMillis()
            Interest interest = interests.get(rand.nextInt(NUM_INTERESTS))
            long randEnd = Calendar.getInstance().getTimeInMillis()
            randTime = randTime + randEnd - randStart
            log.info("Building graph $i for interest $interest")
            similarityService.calculateInterestNeighbors(interest, MAX_PEOPLE, 100)
        }
        cal = cal.getInstance()
        long end = cal.getTimeInMillis()

        long avg = (end - begin - randTime)/NUM_ITERATIONS


        log.info("Began: $begin")
        log.info("Ended: $end")

        interestRes = "Over $NUM_ITERATIONS iterations, it took an average of $avg milliseconds to create" +
             " a graph with a random interest at the center"

        log.info(interestRes)
    }

    def benchmarkAddInterest() {
        Calendar cal = Calendar.getInstance()
        long total = 0

        for (int i = 0; i < NUM_ITERATIONS; i++) {
            long begin = cal.getTimeInMillis()
            String interest;

            long end = cal.getTimeInMillis()
            total = total + end - begin
        }

        long avg = total/NUM_ITERATIONS

        log.info("Total: $total")

        log.info("Over $NUM_ITERATIONS , it took an average of $avg milliseconds to create" +
             " a graph with a random interest at the center")
    }

    def benchmarkInstitutionFilterPersonGraph() {
        log.info("Beginning person graph benchmark")
        Calendar cal = Calendar.getInstance()
        long begin = cal.getTimeInMillis()
        long randTime = 0
        long interests = 0
        List<Person> people = Person.findAll()
        List<Institution> institutions = Institution.findAll()

        for(int i = 0; i < NUM_ITERATIONS; i++) {
            long randStart = Calendar.getInstance().getTimeInMillis()
            Person person = people.get(rand.nextInt(NUM_PEOPLE))
            int maxFilter = rand.nextInt(institutions.size())
            Set<Long> filterSet = new HashSet<Long>()
            while (filterSet.size() < maxFilter) {
                filterSet.add(institutions.get(rand.nextInt(institutions.size())).id)
            }
            InstitutionFilter filter = new InstitutionFilter(filterSet)
            long randEnd = Calendar.getInstance().getTimeInMillis()
            log.info("RandTime: " + (randEnd - randStart))
            randTime = randTime + randEnd - randStart
            if(person != null){
                long interestSize = person.interests.size()
                log.info("Building graph $i for person $person with " + interestSize + " interests.")
                interests = interests + interestSize
                similarityService.calculatePersonNeighbors(person, MAX_PEOPLE, filter)
            } else{
                i--
            }
        }
        cal = cal.getInstance()
        long end = cal.getTimeInMillis()

        int avg = ((int)(end - begin - randTime))
        avg=avg/NUM_ITERATIONS

        int intAvg = (end - begin - randTime)/interests

        log.info("Began: $begin")
        log.info("Ended: $end")
        personFilterRes = "Over $NUM_ITERATIONS iterations, it took an average of $avg milliseconds to create" +
             " a graph with a random person at the center and an institution filter \n Over $interests interests, it took an average " +
                "of $intAvg milliseconds to create a graph for that interest"
        log.info(personFilterRes)
    }

    def benchmarkInstitutionFilterInterestGraph() {
        log.info("Beginning interest graph benchmark")
        Calendar cal = Calendar.getInstance()
        long begin = cal.getTimeInMillis()
        long randTime = 0
        List<Interest> interests= Interest.findAll()
        List<Institution> institutions = Institution.findAll()

        for(int i = 0; i < NUM_ITERATIONS; i++) {
            long randStart = Calendar.getInstance().getTimeInMillis()
            Interest interest = interests.get(rand.nextInt(NUM_INTERESTS))
            int maxFilter = rand.nextInt(institutions.size())
            Set<Long> filter = new HashSet<Long>()
            while (filter.size() < maxFilter) {
                filter.add(institutions.get(rand.nextInt(institutions.size())).id)
            }
            long randEnd = Calendar.getInstance().getTimeInMillis()
            randTime = randTime + randEnd - randStart
            log.info("Building graph $i for interest $interest")
            similarityService.calculateInterestNeighbors(interest, MAX_PEOPLE, 100, filter)
        }
        cal = cal.getInstance()
        long end = cal.getTimeInMillis()

        long avg = (end - begin - randTime)/NUM_ITERATIONS


        log.info("Began: $begin")
        log.info("Ended: $end")

        interestFilterRes = "Over $NUM_ITERATIONS iterations, it took an average of $avg milliseconds to create" +
             " a graph with a random interest and an institution filter at the center"

        log.info(interestFilterRes)
    }

    def cleanUpGorm() {
        def session = sessionFactory.currentSession
        session.flush()
        session.clear()
        propertyInstanceMap.get().clear()
    }
}
