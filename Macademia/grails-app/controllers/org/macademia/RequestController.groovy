package org.macademia

import grails.converters.JSON

class RequestController {
    def collaboratorRequestService
    def jsonService
    def similarityService
    def interestService
    def personService
    def institutionService
    def autocompleteService
    def institutionGroupService

    static allowedMethods = [save: "POST"]

    def index = {
        redirect(action: "manage", params: params)
    }

    def list = {
        params.max = Math.min(params.max ? params.int('max') : 10, 100)
        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        def list = CollaboratorRequest.list()
        if (institutions) {
            list = list.findAll({it.creator.isMatch(institutions)})
        }
        [collaboratorRequestList: list, collaboratorRequestInstanceTotal: list.size()]
    }

    def manage = {
        params.max = Math.min(params.max ? params.int('max') : 10, 100)
        Person user
        if (!params.id){
            user = request.authenticated
        }
        else {
            user = Person.get(params.id)
            //admin check
            if (!request.authenticated.canEdit(user)){
                throw new IllegalArgumentException("not authorized")
            }
        }
        def CollaboratorRequestList = CollaboratorRequest.findAllByCreator(user)
        [collaboratorRequestList: CollaboratorRequestList, collaboratorRequestInstanceTotal: CollaboratorRequest.count(), user:user ]
    }

    def create = {
        def collaboratorRequest = new CollaboratorRequest()
        return [collaboratorRequest: collaboratorRequest]
    }

    def save = {
        def collaboratorRequest = new CollaboratorRequest()
        if (params.requestId) {
            collaboratorRequest = collaboratorRequestService.get(params.requestId as long)
            autocompleteService.removeRequest(collaboratorRequest)
        }
        def fields = ['title', 'description', 'expiration']
        collaboratorRequest.properties[fields] = params
        if (!params.title){
             collaboratorRequest.title = "No Title"
        }
        collaboratorRequest.creator = request.authenticated
        def oldKeywords = collaboratorRequest.keywords
        if (params.keywords){
            interestService.parseInterests(params.keywords).each({
                collaboratorRequest.addToKeywords(it)
            })
        }
        interestService.deleteOld(oldKeywords, collaboratorRequest)
        collaboratorRequestService.save(collaboratorRequest)
        collaboratorRequest.save(flush : true)  // flush to get the id
        autocompleteService.addRequest(collaboratorRequest)

        redirect('uri' : Utils.makeUrl(params.group, 'request', collaboratorRequest.id, true))
    }

    def show = {
        def collaboratorRequest = CollaboratorRequest.get(params.id)
        if (!collaboratorRequest) {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest'), params.id])}"
            redirect(action: "manage")
        }
        else {
            def String allKeywords = ""
            for (keyword in collaboratorRequest.keywords){
                allKeywords += keyword.text+" ,"
            }
            [collaboratorRequest: collaboratorRequest, allKeywords: allKeywords]
        }
    }

    def edit = {
        def cr = CollaboratorRequest.get(params.id)
        if (!cr) {
            render("no collaborator request with id ${params.id}")
        }
        else {
            String keywords = cr.keywords.collect({it.text}).join(',')
            render(view : 'create', model : [collaboratorRequest: cr, keywords: keywords])
        }
    }


    def delete = {
        def collaboratorRequest = CollaboratorRequest.get(params.requestId)
        def group = Utils.getGroupFromUrl(request.forwardURI)
        if (collaboratorRequest) {
            if (!request.authenticated.canEdit(collaboratorRequest.creator)) {
                throw new IllegalArgumentException("not authorized")
            }
            try {
                collaboratorRequest = collaboratorRequest.merge()
                collaboratorRequestService.delete(collaboratorRequest)
                flash.message = "${message(code: 'default.deleted.message', args: [message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest'), params.id])}"
                redirect(uri: "/$group")
            }
            catch (org.springframework.dao.DataIntegrityViolationException e) {
                flash.message = "${message(code: 'default.not.deleted.message', args: [message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest'), params.id])}"
                redirect(action: "show", id: params.id)
            }
        } else {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest'), params.id])}"
            redirect(uri: "/$group")
        }
    }

    def json = {
        def max
        if(params.maxPerson){
            max = params.maxPerson as int
        }
        else{
            max = 25
        }
        def root = collaboratorRequestService.get((params.id as long))
        Graph graph
        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        graph = similarityService.calculateRequestNeighbors(root, max, institutions)
        def data = jsonService.buildCollaboratorRequestCentricGraph(root, graph)
        render(data as JSON)
    }

    def jit = {
      [:]
    }

    def tooltip = {
        def target = collaboratorRequestService.get((params.id as long))
        def link = null
        log.info("this is $params")
        if (params.root) {
            if(params.root.contains("p")){
                link = personService.get((params.root.split("_")[1]) as long)
            } else if (params.root.contains("r")){
                link = collaboratorRequestService.get((params.root.split("_")[1]) as long)
            }

        }

        def exact = [] as Set
        def close = [:]
        def linkName = ''
        // Are we mousing over a user who has a link to the root?
        if (link != null && target != link) {
            def allInterests = []
            if(params.root.contains("p")){
              if (target.creator==link) {
                exact.add("Created By ${target.creator.fullName}")
              }
                allInterests = link.interests
                linkName = link.fullName
            } else if (params.root.contains("r")){
                allInterests = link.keywords
                linkName = link.title
            }
            for(Interest i: allInterests) {
                if(target.keywords.contains(i)){
                    exact.add(i.text)
                }
                for(SimilarInterest sim: similarityService.getSimilarInterests(i).list){
                    //println("first: $ir.first second: $ir.second")
                    Interest second = Interest.findById(sim.interestId)

                    if(target.keywords.contains(second)){
                        if (!close[second]) {
                            close[second] = []
                        }
                        close[second].add(i)
                    }
                }
            }
            for (Interest ci: close.keySet()) {
                close[ci] = close[ci].collect({it.text}).join(", ")
            }
        }

        [target: target, link: link, close: close, exact: exact, linkName: linkName]
    }

}
