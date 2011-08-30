package org.macademia

import grails.converters.JSON

class JsonService {

    def collaboratorRequestService
    def personService
    def springcacheService

      //max number of interests per interest-centric graph
    int DEFAULT_MAX_INTERESTS_INTEREST_CENTRIC = 25

    boolean transactional = true

    def parseJsonToGroovy(json) {
        def data = JSON.parse(json)
        // println("recieved JSON: "+data)
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        Map<Long, Object> collaboratorRequestNodes = [:]
        def splitId

        //rebuilding the separate personNodes, collaboratorRequestNodes and interestNodes maps
        for (Object node in data) {
            splitId = node['id'].split("_")
            if (splitId[0] == "p") {
                //this is a person node
                node['id'] = splitId[1]
                personNodes.putAt(splitId[1], node)
            } else if (splitId[0] == "i") {
                node['id'] = splitId[1]
                interestNodes.putAt(splitId[1], node)
            } else if (splitId[0] == "r") {
                node['id'] = splitId[1]
                collaboratorRequestNodes.putAt(splitId[1], node)
            }
        }

        for (Map<Object, Object> node in personNodes.values()) {
            def adjacencies = []
            for (Object adj in node['adjacencies']) {
                splitId = adj['nodeTo'].split("_")
                adj['nodeTo'] = splitId[1]
                adjacencies.add(adj['nodeTo'])
                //println(adjacencies)
            }
            //println(adjacencies)
            node['adjacencies'] = adjacencies
        }

        for (Map<Object, Object> node in interestNodes.values()) {
            def adjacencies = []
            for (Object adj in node['adjacencies']) {
                splitId = adj['nodeTo'].split("_")
                adj['nodeTo'] = splitId[1]
                adjacencies.add(adj['nodeTo'])
            }

            node['adjacencies'] = adjacencies
        }

        for (Map<Object, Object> node in collaboratorRequestNodes.values()) {
            def adjacencies = []
            for (Object adj in node['adjacencies']) {
                splitId = adj['nodeTo'].split("_")
                adj['nodeTo'] = splitId[1]
                adjacencies.add(adj['nodeTo'])
            }

            node['adjacencies'] = adjacencies
        }

        return [personNodes: personNodes, interestNodes: interestNodes, collaboratorRequestNodes: collaboratorRequestNodes]
    }

    def buildUserCentricGraph(Person person, Graph graph){
        // Mapping from ids to nodes
        // Begin by adding root and root interests
        // then collaboratorRequests related to root interests
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        Map<Long, Object> collaboratorRequestNodes = [:]
        personNodes["p_" + person.id] = makeJsonForPerson(person)


        for (Interest i: person.interests) {
            if (graph.getAdjacentEdges(i).size() > 1) {
                interestNodes["i_" + i.id] = makeJsonForInterest(i)
                interestNodes["i_" + i.id]['adjacencies'].add("p_" + person.id)
                personNodes["p_" + person.id]['adjacencies'].add("i_" + i.id)
            }
        }

        for (Person p: graph.getPeople()){
            if(p==person || p == null){
                continue
            }
            def pid = "p_${p.id}"
            personNodes[pid] = makeJsonForPerson(p)
            for (Edge e: graph.getAdjacentEdges(p)){
                e.reify()
                def iid = "i_${e.interest.id}"
                if(!interestNodes[iid]){
                    interestNodes[iid] = makeJsonForInterest(e.interest)
                }
                personNodes[pid]['adjacencies'].add(iid)
                interestNodes[iid]['adjacencies'].add(pid)
            }
        }
        for (CollaboratorRequest r:  graph.getRequests()) {
            def rid = "r_${r.id}"
            collaboratorRequestNodes[rid] = makeJsonForCollaboratorRequest(r)
            for (Edge e: graph.getAdjacentEdges(r)){
                e.reify()
                def iid = "i_${e.interest.id}"
                if(!interestNodes[iid]){
                    interestNodes[iid] = makeJsonForInterest(e.interest)
                }
                collaboratorRequestNodes[rid]['adjacencies'].add(iid)
                interestNodes[iid]['adjacencies'].add(rid)
            }
        }
        for (CollaboratorRequest r: collaboratorRequestService.findAllByCreator(person)){
            //This makes sure that collaborator requests created by the root person show up regardless of connectedness
            def rid = "r_${r.id}"
            if (!collaboratorRequestNodes[rid]){
                collaboratorRequestNodes[rid] = makeJsonForCollaboratorRequest(r)
            }
            collaboratorRequestNodes[rid]['adjacencies'].add("p_" + person.id)
            personNodes["p_" + person.id]['adjacencies'].add(rid)
        }

        adjacencyMap(personNodes)
        adjacencyMap(interestNodes)
        adjacencyMap(collaboratorRequestNodes)
        addColors(personNodes, interestNodes, collaboratorRequestNodes)

        return personNodes.values() + interestNodes.values() + collaboratorRequestNodes.values()
    }

    def buildInterestCentricGraph(Interest interest, Graph graph) {
        // Mapping from ids to nodes
        // Begin by adding root and root interests
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        Map<Long, Object> collaboratorRequestNodes = [:]
        def riid = "i_${interest.id}"
        interestNodes[riid] = makeJsonForInterest(interest)

        for (Interest i: graph.getInterests()) {
            def iid = "i_${i.id}"
            if(!interestNodes[iid]) {
               interestNodes[iid] = makeJsonForInterest(i)
            }
            if(iid!=riid){
                interestNodes[riid]['adjacencies'].add(iid)
                interestNodes[iid]['adjacencies'].add(riid)
            }
            for(Edge e: graph.getAdjacentEdges(i)){
                e.reify()
                if(e.person){
                    def pid = "p_${e.person.id}"
                    if(!personNodes[pid]) {
                        personNodes[pid] = makeJsonForPerson(e.person)
                    }
                    interestNodes[iid]['adjacencies'].add(pid)
                    personNodes[pid]['adjacencies'].add(iid)
                }
                if(e.request){
                  def rid = "r_${e.request.id}"
                  if(!collaboratorRequestNodes[rid]) {
                      collaboratorRequestNodes[rid] = makeJsonForCollaboratorRequest(e.request)
                  }
                  interestNodes[iid]['adjacencies'].add(rid)
                  collaboratorRequestNodes[rid]['adjacencies'].add(iid)
                }
            }
        }

        adjacencyMap(personNodes)
        adjacencyMap(interestNodes)
        adjacencyMap(collaboratorRequestNodes)
        addColors(personNodes, interestNodes, collaboratorRequestNodes)

        return interestNodes.values() + collaboratorRequestNodes.values() + personNodes.values()
    }

    def buildCollaboratorRequestCentricGraph(CollaboratorRequest request, Graph graph) {
        // Mapping from ids to nodes
        // Begin by adding root and root interests
        // then collaboratorRequests related to root interests
        Map<Long, Object> personNodes = [:]
        Map<Long, Object> interestNodes = [:]
        Map<Long, Object> collaboratorRequestNodes = [:]
        collaboratorRequestNodes["r_" + request.id] = makeJsonForCollaboratorRequest(request)
        personNodes["p_"+request.creator.id] = makeJsonForPerson(request.creator)
        personNodes["p_"+request.creator.id]['adjacencies'].add("r_" + request.id)
        collaboratorRequestNodes["r_" + request.id]['adjacencies'].add("p_" + request.creator.id)

        for (Interest i: request.keywords) {
            interestNodes["i_" + i.id] = makeJsonForInterest(i)
            interestNodes["i_" + i.id]['adjacencies'].add("r_" + request.id)
            collaboratorRequestNodes["r_" + request.id]['adjacencies'].add("i_" + i.id)
        }

        for (CollaboratorRequest r: graph.getRequests()){
            if(r==request){
               continue
            }
            def rid = "r_${r.id}"
            collaboratorRequestNodes[rid] = makeJsonForCollaboratorRequest(r)
            for (Edge e: graph.getAdjacentEdges(r)){
                e.reify()
                def iid = "i_${e.interest.id}"
                if(!interestNodes[iid]){
                    interestNodes[iid] = makeJsonForInterest(e.interest)
                }
                collaboratorRequestNodes[rid]['adjacencies'].add(iid)
                interestNodes[iid]['adjacencies'].add(rid)
            }
        }
        for (Person p: graph.getPeople()){
            def pid = "p_${p.id}"
            personNodes[pid] = makeJsonForPerson(p)
            for (Edge e: graph.getAdjacentEdges(p)){
                e.reify()
                def iid = "i_${e.interest.id}"
                if(!interestNodes[iid]){
                    interestNodes[iid] = makeJsonForInterest(e.interest)
                }
                personNodes[pid]['adjacencies'].add(iid)
                interestNodes[iid]['adjacencies'].add(pid)
            }
        }

        adjacencyMap(personNodes)
        adjacencyMap(interestNodes)
        adjacencyMap(collaboratorRequestNodes)
        addColors(personNodes, interestNodes, collaboratorRequestNodes)

        return collaboratorRequestNodes.values() + personNodes.values() + interestNodes.values()
    }

    //Hash the people to colours
    def addColors(personNodes, interestNodes, collaboratorRequestNodes) {
        def personAndRequestColors = [:]
        def collegeColors = [:]

        for (String pid in personNodes.keySet()) {
            String fullName = personNodes[pid]['name']

            def inst = personNodes[pid]['data']['institution']
            if (collegeColors != null && collegeColors.containsKey(inst.toString())) {
              personAndRequestColors[pid] = collegeColors.(inst.toString())
            }
            else {
              int i = fullName.hashCode() % org.macademia.MacademiaConstants.COLORS.size()
              collegeColors[inst.toString()] = org.macademia.MacademiaConstants.COLORS[i]
              personAndRequestColors[pid] = org.macademia.MacademiaConstants.COLORS[i]
            }
        }

        for (String rid in collaboratorRequestNodes.keySet()) {
            personAndRequestColors[rid] = MacademiaConstants.REQUEST_COLOR
        }

        for (String pid in personNodes.keySet()) {
            Map<Object, Object> node = personNodes[pid]
            String c = personAndRequestColors[pid]
            for (Object adj in node['adjacencies']) {
                if(adj['nodeTo'].contains('r_')){
                    //makes the edges between root person and own collaborator requests red
                    adj['data'].putAt("\$color", MacademiaConstants.REQUEST_COLOR)
                } else {
                    adj['data'].putAt("\$color", c)
                }
            }
        }

        for (String cid in collaboratorRequestNodes.keySet()) {
            Map<Object, Object> node = collaboratorRequestNodes[cid]
            String c = personAndRequestColors[cid]
            for (Object adj in node['adjacencies']) {
                if(adj['nodeTo'].contains('p_')){
                    //makes the edges between root collaborator request and creator creator's edge color
                    adj['data'].putAt("\$color", personAndRequestColors[adj['nodeTo']])
                } else {
                    adj['data'].putAt("\$color", c)
                }
            }
        }


        for (Map<Object, Object> node in interestNodes.values()) {
            for (Object adj in node['adjacencies']) {
                String id = adj['nodeTo']
                if (personAndRequestColors[id]) {
                    adj['data'].putAt("\$color", personAndRequestColors[id])
                } else{
                    adj['data'].putAt("\$color", "#0080FF")
                }
            }
        }
    }

    /**
     * Since people appear more than once, people nodes must not
     * use their own id.
     */
    def makeJsonForPerson(Person p) {
        return [
                id: "p_" + p.id,
                name: p.fullName,
                data: [
                        unmodifiedId: p.id,
                        type: 'person',
                        institution: p.retrievePrimaryInstitution().id
                ],
                adjacencies: []
        ]
    }

    def makeJsonForInterest(Interest i) {
        return [
                id: "i_" + i.id,
                name: i.text,
                data: [
                        unmodifiedId: i.id,
                        type: 'interest'
                ],
                adjacencies: []
        ]
    }

    def makeJsonForCollaboratorRequest(CollaboratorRequest r) {
        return [
                id: "r_" + r.id,
                name: r.title,
                data: [
                        unmodifiedId: r.id,
                        type: 'request'
                ],
                adjacencies: []
        ]
    }

    def makeJsonForIgMap() {
        return springcacheService.doWithBlockingCache("institutionCache", "igmap", {
            def igMap = [:]
            for (ig in InstitutionGroup.list().sort({it.name.toLowerCase()})) {
                Set<Institution> insts
                if (ig.crossCutting) {
                    insts = new HashSet<Institution>()
                    for (Institution i : ig.institutions) {
                        for (Person p : personService.findAllInInstitution(i)) {
                            insts.addAll(p.memberships.institution)
                        }
                    }
                } else {
                    insts = ig.institutions
                }
                igMap[ig.id] = [
                        info: [name: ig.name, abbrev: ig.abbrev],
                        institutions: insts.sort({it.name.toLowerCase()}).collect({makeJsonForInstitution(it)})
                    ]
            }
            return igMap
        })
    }

    def makeJsonForInstitutions() {
        return Institution.all.collect({makeJsonForInstitution(it)})
    }

    def makeJsonForInstitution(Institution institution) {
        return  [
            id : institution.id,
            name: institution.name,
            emailDomain : institution.emailDomain,
            url : institution.webUrl
        ]
    }

    def makeJsonForNonPrimaryInstitutions(Person person){
        def nonPrimaries = [] as Set
        for (institution in person.retrieveNonPrimaryInstitutions()){
            nonPrimaries.add(
                    [
                            institutionName: institution.name,
                            institutionUrl: institution.webUrl
                    ]
            )
        }
        return nonPrimaries
    }

    //make the adjacency list a map so we can store data about adjacencies
    def adjacencyMap(Map<Long, Object> objectNodes) {
        for (Map<Object, Object> node: objectNodes.values()) {
            node["adjacencies"] = node["adjacencies"].collect({
                [
                        "nodeTo": it,
                        "data": [:]
                ]
            })
        }
    }

    def jsIdToId(String jsId) {
        return jsId.split("_")[1]
    }


}