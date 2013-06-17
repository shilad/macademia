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

        def colleges2 = ig.toString()
        def colleges1 = institutionGroupService.retrieveInstitutions(ig) //colleges1 is a set of strings
        //get the people with pictures from colleges1
        ArrayList<Person> peopleWithPictures = new ArrayList<Person>()
        for(Institution i : colleges1.toArray(Institution))
        {
            def peopleInCollege = personService.findAllInInstitution(i) //an array of Persons?
            for(Person p: peopleInCollege)
            {
                if (p.imageSubpath!=null)
                {
                    peopleWithPictures.add(p)
                }


            }
        }

        int numPeopleWithPictures = peopleWithPictures.size()

        if (numPeopleWithPictures>=26)
        {
            //display 2 rows of 13 pictures
        }

        else if (13<numPeopleWithPictures && numPeopleWithPictures<26)
        {
            int topRow = ceil(numPeopleWithPictures/2)
            //display the first topRow photos centered
            //display the rest of the photos (numPeopleWithPictures-topRow) in bottom row centered
        }

        else if (numPeopleWithPictures<=13)
        {
            //display all the photos centered in one row
        }

        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]


        String colls = institutionGroupService.retrieveInstitutions(ig)
        String colleges = colls[1..-2];



        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
        def igCounts = getInstitutionGroupCounts()
        ta.recordTime("count ig memberships")
        def igs = igCounts.keySet() as ArrayList
        igs.sort({igCounts[it]})
        igs = igs.reverse()
        def r = random.nextInt(NUM_RANDOM_LISTS)
        def people = getRandomPeopleWithImages(6, r)
        ta.recordTime("find random images")
//        ta.analyze()
        [people : people, igs : igs, colleges : colleges, consortium : consortium]
    }
}