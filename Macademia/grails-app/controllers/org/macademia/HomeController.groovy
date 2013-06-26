package org.macademia

//import grails.plugin.springcache.annotations.Cacheable

class HomeController {
    public static int NUM_PEOPLE = 26
    public static int NUM_RANDOM_LISTS = 20

    def institutionGroupService
    def personService
    def springcacheService
    def imageService
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
        ArrayList<Long> Ids = new ArrayList<Long>()
        def people = getRandomPeopleWithImages(NUM_PEOPLE, r, Ids)
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

    def getRandomPeopleWithImages(int numPeople, int randomNum, ArrayList<Long> allowableIds) {
        return springcacheService.doWithCache(
                'homeCache',
                'getRandomPeople' + randomNum,
                {personService.findRandomPeopleWithImage(numPeople, allowableIds)}
        )
    }

//    //Don't mess with this method
//    def getRandomPeopleWithImages(int numPeople, int randomNum) {
//        return springcacheService.doWithCache(
//                'homeCache',
//                'getRandomPeople' + randomNum,
//                {personService.findRandomPeopleWithImage(numPeople)}
//        )
//    }


    def consortia() {
        InstitutionFilter filter =  institutionGroupService.getInstitutionFilterFromParams(params)
        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)
        ta.recordTime("find the institution group from params")
        List<Long> Ids = personService.getPeopleInInstitutionFilter(filter, params)
        ta.recordTime("get the ids of the people from the consortium")
        ArrayList<Long> IdsWithPics = new ArrayList<Long>()




        for (Long id:Ids){
            Person p = personService.get(id)
            ta.recordTime("get a single person from their id")
            IdsWithPics.add(id)
            ta.recordTime("add a single person to the arrayList of ids")
            if (p.imageSubpath==null){
                ta.recordTime("check to see if the image subpath of the person is null")
                IdsWithPics.remove(id)
                ta.recordTime("remove a person's id from the list of ids that have pictures")
//                println("if")
            }
        }

        ta.recordTime("generate the list of peoples' ids that have pictures")






        int numPeople=0

        if (IdsWithPics.size()>=26){
            numPeople=26
        }
        else if (13<IdsWithPics.size() && IdsWithPics.size()<26){
            numPeople=IdsWithPics.size()
       print("lad")
        }
        else if (IdsWithPics.size()<=13){
            numPeople=IdsWithPics.size()
        }

        ta.recordTime("determine how many people to get")






        //gets the entire institution group name
        String consortiumName = (ig)
        //removes abreviation from the end of institution group name
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]
        println(consortium)
        //gets colleges/universities in the consortium and removes the formating[]
        String colls = institutionGroupService.retrieveInstitutions(ig)
        String colleges = colls[1..-2];


        def igCounts = getInstitutionGroupCounts()
        ta.recordTime("count ig memberships")
        def igs = igCounts.keySet() as ArrayList
        igs.sort({igCounts[it]})
        println("sam")
        igs = igs.reverse()
        def r = random.nextInt(NUM_RANDOM_LISTS)
        def people = getRandomPeopleWithImages(numPeople, r, IdsWithPics)
        ta.recordTime("find random images")
//        ta.analyze()
        [
                people : people,
                igs : igs,
                colleges : colleges,
                defaultImageUrl : getDefaultImageUrl(),
                consortium : consortium,
                institutionGroup: ig
        ]
    }

    def consortiaEdit(){

        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)

        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]


        [
                consortium : consortium,
                imgOwner : ig,
                defaultImageUrl : getDefaultImageUrl(),
                institutionGroup:ig
        ]
    }

    def getDefaultImageUrl() {
//        String l = r.imageLink(src : MacademiaConstants.DEFAULT_IMG)
        String l = r.resource(dir:'images', file:MacademiaConstants.DEFAULT_IMG)
        if (l[0] == "'") {
            l = l[1..-1]
        }
        if (l[-1] == "'") {
            l = l[0..-2]
        }
        return l

    }

    def processConsortiaEdit(){

        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)

        //println(params.text);
        if(params.keySet().contains("nameText") && params.nameText !="/ "){
           ig.setName(params.nameText)
        }
        if (params.keySet().contains("blurbText") && params.nameText !="/ ") {
           ig.setDescription(params["blurbText"])
        }
        if (params.keySet().contains('imageSubpath')) {
            ig.setImageSubpath(params.imageSubpath)
        }
        if (params.keySet().contains("webUrl") && params.nameText !="/ ")
            ig.setWebUrl(params.webUrl)

//        else if(params.keySet().contains("newlogo")
         //   ig.setImageSubpath(params[template])
        ig.save(flush: true, failOnError: true);


        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        println(conSplit[0])
        String consortium = conSplit[0]

        redirect(action : 'consortia', params: [group : params.group])
    }
}