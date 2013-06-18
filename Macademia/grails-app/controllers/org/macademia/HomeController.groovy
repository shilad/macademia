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
        InstitutionFilter filter =  InstitutionGroupService.getInstitutionFilterFromParams(params)


        /*
       //InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        //def ids = institutions.institutionIds;
        ArrayList<People> people = new ArrayList<People>();
        InstitutionGroup ig = InstitutionGroupService.findByAbbrev(params.group)
        //get institutions
        def institutions = institutionGroupService.retrieveInstitutions(ig)
        //get the people in the institutions
        for (Institution i : ig.getInstitutions()){
            def peopleInInstitution = personService.findAllInInstitution(i)
            for (Person p: peopleInInstitution){
                people.add(p)
            }
        }
*/
        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)

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
        def r = random.nextInt(NUM_RANDOM_LISTS)
        def people = getRandomPeopleWithImages(6, r)
        ta.recordTime("find random images")
//        ta.analyze()
        [people : people, igs : igs, colleges : colleges, consortium : consortium, abrev : abrev]
    }

    def consortiaEdit(){

        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)

        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]
        [consortium : consortium]
    }
}