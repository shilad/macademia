package org.macademia

//import grails.plugin.springcache.annotations.Cacheable

class HomeController {
    public static int NUM_PEOPLE = 26
    public static int NUM_RANDOM_LISTS = 20

    def institutionGroupService
    def personService
    def springcacheService
    def random = new Random()

    def index = {
        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
        def igCounts = getInstitutionGroupCounts()
        ta.recordTime("count ig memberships")
        def igs = igCounts.keySet() as ArrayList
        igs.sort({igCounts[it]})
        igs = igs.reverse()
        def r = random.nextInt(NUM_RANDOM_LISTS)
        def people = getRandomPeopleWithImages(NUM_PEOPLE, r)
        ta.recordTime("find random images")
//        ta.analyze()
        [people : people, igs : igs]
    }

    def getInstitutionGroupCounts() {
        return springcacheService.doWithCache(
                'homeCache',
                'institutionGroupCounts',
                {
                    def igCounts = personService.getInstitutionGroupCounts()
                    def all = institutionGroupService.getAllGroup()
                    def dg = institutionGroupService.getDefaultGroup()
                    if (all && dg && igCounts[all] && igCounts[dg] && all != dg) {
                        igCounts[dg] = igCounts[all] - 1
                    }
                    return igCounts
                }
        )
    }

    def getRandomPeopleWithImages(int numPeople, int randomNum) {
        return springcacheService.doWithCache(
                'homeCache',
                'getRandomPeople' + randomNum,
                {personService.findRandomPeopleWithImage(numPeople)}
        )
    }

    def consortia() {
        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)
        InstitutionFilter filter =  institutionGroupService.getInstitutionFilterFromParams(params)
        List<Long> peopleIds = institutionGroupService.getPeopleInInstitutionFilter(filter)
        int numPeopleWithPictures=0
        for(Long id: peopleIds) {
            //if the person has a photo, add 1 to numPeopleWithPictures
            Person p = Person.get(id)
            if (p.imageSubpath!=null)
            {
                numPeopleWithPictures++
            }
        }

        if (numPeopleWithPictures>=26)
        {
            //display 2 rows of 13 pictures
            def r = random.nextInt(NUM_RANDOM_LISTS)
            def people = getRandomPeopleWithImages(26, r)

        }

        else if (13<numPeopleWithPictures && numPeopleWithPictures<26)
        {
            int topRow = Math.ceil(numPeopleWithPictures/2)
            //display the first topRow photos centered
            //display the rest of the photos (numPeopleWithPictures-topRow) in bottom row centered
            def r = random.nextInt(NUM_RANDOM_LISTS)
            def people = getRandomPeopleWithImages(numPeopleWithPictures, r)

        }

        else if (numPeopleWithPictures<=13)
        {
            //display all the photos centered in one row
            def r = random.nextInt(NUM_RANDOM_LISTS)
            def people = getRandomPeopleWithImages(numPeopleWithPictures, r)

        }

        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]
        String abrev = conSplit[1]

        String colls = institutionGroupService.retrieveInstitutions(ig)
        String colleges = colls[1..-2];



        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
        def igCounts = getInstitutionGroupCounts()
        ta.recordTime("count ig memberships")
        def igs = igCounts.keySet() as ArrayList
        igs.sort({igCounts[it]})
        igs = igs.reverse()
//        def r = random.nextInt(NUM_RANDOM_LISTS)
//        def people = getRandomPeopleWithImages(26, r)
        ta.recordTime("find random images")
//        ta.analyze()
        [people : people, igs : igs, colleges : colleges, consortium : consortium, abrev : abrev]
    }
}