package org.macademia

import grails.converters.JSON;

class InterestController {

    def interestService
    def institutionService
    def similarityService
    def personService
    def jsonService
    def institutionGroupService

    def index = { }

    def list = {
        [interestList: Interest.list()]
    }

    def name = {
        Interest i = Interest.get(params.id)
        render(i.text)
    }

    def json = {
        def maxPeople
        def maxInterests
        if(params.maxPerson){
            maxPeople = params.maxPerson.toInteger()
        }
        else if (params.density) {
            maxPeople = (params.density as int) * 8
            maxInterests = (params.density as int) * 5
        }
        else{
            maxPeople = 25
            maxInterests = 15
        }
        def root = interestService.get((params.id as long))
        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        Graph graph = similarityService.calculateInterestNeighbors(root, maxPeople, maxInterests, institutions)
        def data = jsonService.buildInterestCentricGraph(root, graph)
        render(data as JSON)
    }


    def jit = {

      [:]
      //[interest: interestService.get((params.id as long))]

    }

    def tooltip = {
        def interest = interestService.get((params.id as long))
        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        def simInts = similarityService.getSimilarInterests(interest, institutions).collect({Interest.get(it.interestId)})
        def related = new ArrayList<String>()
        for(Interest i: simInts){
            if(i!=null){
                related.add(i.text)
            }
        }
        if(related.isEmpty()){
            related.add("No related Interests")
        }
        [
            interest : interest,
            people : personService.findByInterest(interest),
            related : related,
        ]
    }

    def show = {
        def interest = Interest.get(params.id)
        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        def peopleWithInterest = interest.people
        if (institutions) {
            peopleWithInterest = peopleWithInterest.findAll({it.isMatch(institutions)})
        }
//        println("institutions are " + institutions)
        def interests = similarityService.getSimilarInterests(interest.id, 50, similarityService.absoluteThreshold, institutions)
        def relatedInterests = interests.list.collect({Interest.findById(it.interestId)})
        if(relatedInterests.contains(interest)){
            relatedInterests.remove(interest)
        }
        if (!interest) {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest'), params.id])}"
            redirect(action: "list")
        } else {
            [interest: interest, peopleWithInterest: peopleWithInterest, relatedInterests: relatedInterests]
        }
    }

    def analyze = {
        if (!params.interest || !params.interest.trim()) {
            render('unknown')
        } else {
            Interest interest = interestService.analyze(params.interest)
            render(interest.articleName)
        }
    }

}
