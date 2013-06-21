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
        InstitutionGroup ig = institutionGroupService.findByAbbrev(params.group)
        List<Long> Ids = personService.getPeopleInInstitutionFilter(filter, params)
        ArrayList<Long> IdsWithPics = new ArrayList<Long>()
         println("hi")
        for (Long id:Ids){
            Person p = personService.get(id)
            if (p.imageSubpath!=null){
                IdsWithPics.add(id)
            println("if")
            }
        }
         println("shi")


//        if (numPeopleWithPicture>=26){
//            //display 2 rows of 13 pictures
//            def r = random.nextInt(NUM_RANDOM_LISTS)
//            def people = getRandomPeopleWithImages(26, r)
//
//        }
//
//        else if (13<numPeopleWithPicture && numPeopleWithPicture<26){
//            //display n of the pictures on the top row, and the rest on the bottom
//            int topRow=Math.ceil(numPeopleWithPicture/2)
//            int bottomRow=numPeopleWithPicture-topRow
//            def r = random.nextInt(NUM_RANDOM_LISTS)
//            def people = getRandomPeopleWithImages(numPeopleWithPicture, r)
//        }
//
//        else if (numPeopleWithPicture<=13){
//            //display all the pictures in one row
//            def r = random.nextInt(NUM_RANDOM_LISTS)
//            def people = getRandomPeopleWithImages(numPeopleWithPicture, r)
//        }

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
        //gets the entire institution group name
        String consortiumName = (ig)
        //removes abreviation from the end of institution group name
        String[] conSplit = consortiumName.split("\\(")
        String consortium = conSplit[0]
        //gets colleges/universities in the consortium and removes the formating[]
        String colls = institutionGroupService.retrieveInstitutions(ig)
        String colleges = colls[1..-2];
       println("lad")
        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
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
        [people : people, igs : igs, colleges : colleges, consortium : consortium]
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
        if(params.keySet().contains("nameText")){
           ig.setName(params.nameText)}
        else if(params.keySet().contains("blurbText")) {
           ig.setDescription(params["blurbText"])
        }
//        else if(params.keySet().contains("newlogo")
//            ig.setImageSubpath(params["imageSub"])

        ig.save(flush: true, failOnError: true);


        String consortiumName = (ig)
        String[] conSplit = consortiumName.split("\\(")
        println(conSplit[0])
        String consortium = conSplit[0]

        redirect(action : 'consortiaEdit', params: [group : params.group])
    }
}