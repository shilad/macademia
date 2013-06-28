package org.macademia

class ConsortiumController {
    public static int NUM_PEOPLE = 26
    public static int NUM_RANDOM_LISTS = 3

    def institutionGroupService
    def personService
    def springcacheService
    def imageService
    def random = new Random()

    private def getRandomPeopleWithImages(int numPeople, int randomNum, InstitutionGroup consortium, ArrayList<Long> allowableIds) {
        return springcacheService.doWithCache(
                'homeCache',
                'getRandomPeople' + consortium.name + randomNum,
                {personService.findRandomPeopleWithImage(numPeople, allowableIds)}
        )
    }

    private def getInstitutionGroupCounts() {
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

    def show() {
        InstitutionFilter filter =  institutionGroupService.getInstitutionFilterFromParams(params)
        TimingAnalysis ta = new TimingAnalysis()
        ta.startTime()
        InstitutionGroup consortium = institutionGroupService.findByAbbrev(params.group)

        ta.recordTime("find the institution group from params")
        List<Long> ids = personService.getPeopleInInstitutionFilter(filter, params)
        ta.recordTime("get the ids of the people from the consortium")
        def r = random.nextInt(NUM_RANDOM_LISTS)
        def people = getRandomPeopleWithImages(NUM_PEOPLE, r, consortium, ids)
        ta.recordTime("get random people with images")
        def igCounts = getInstitutionGroupCounts()
        ta.recordTime("count ig memberships")

        String colleges = ""
        for (Institution i : institutionGroupService.retrieveInstitutions(consortium)) {
            if (!colleges.isEmpty()) colleges += ", "
            colleges += i.getName()
        }
        ta.recordTime("making colleges string")
        ta.analyze()

        def igsk = igCounts.keySet() as ArrayList
        igsk.sort({igCounts[it]})
        igsk = igsk.reverse()
        println(igsk)
        println(consortium)


        [
                igsk: igsk,
                people : people,
                igs : igCounts.keySet() as ArrayList,
                colleges : colleges,
                defaultImageUrl : getDefaultImageUrl(),
                consortium : consortium.name,
                institutionGroup: consortium
        ]
    }

    def edit(){

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

    def save(){

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

//        String consortiumName = (ig)
//        String[] conSplit = consortiumName.split("\\(")
//        println(conSplit[0])
//        String consortium = conSplit[0]

        redirect(action : 'show', params: [group : params.group])
    }
}
