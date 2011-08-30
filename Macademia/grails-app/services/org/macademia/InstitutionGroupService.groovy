package org.macademia

class InstitutionGroupService {

    def institutionService

    static transactional = true

    Collection<InstitutionGroup> findAll() {
        return InstitutionGroup.list()
    }

    Collection<InstitutionGroup> findAllByInstitution(Institution i) {
        if (i.institutionGroups){
            return i.institutionGroups
        } else {
            def other = InstitutionGroup.findByAbbrev("other")
            if (!other){
                other = new InstitutionGroup(name: "other", abbrev: "other")
                Utils.safeSave(other)
            }
            return [other] as Set
        }
    }

    InstitutionGroup findByAbbrev(String name) {
        return InstitutionGroup.findByAbbrev(name)
    }

    InstitutionGroup getAllGroup() {
        return findByAbbrev("all")
    }

    InstitutionGroup getDefaultGroup() {
        return findByAbbrev(MacademiaConstants.DEFAULT_GROUP)
    }

    Institution findDefaultInstitutionForGroup(InstitutionGroup ig) {
        // What should we do here in the general case?
        if (ig.abbrev == 'biologyscholars') {
            return Institution.findByName('Biology Scholars')
        } else {
            return null
        }
    }

    InstitutionFilter getInstitutionFilterFromParams(params) {
        if (params.institutions == null || params.institutions == 'null') {
            params.institutions = 'all'
        }
        if (params.group == null || params.group == 'null') {
            params.group = 'all'
        }
        if (params.institutions == 'all' && params.group == 'all') {
            return null // everything
        } else if (params.institutions == 'all') {
            InstitutionGroup ig = findByAbbrev(params.group)
            return new InstitutionFilter(new HashSet<Long>(ig.institutions.collect{it.id}))
        } else {
            InstitutionGroup ig = findByAbbrev(params.group)
            def splitInstitutions = ("+" + params.institutions).tokenize("//+c_")
            Set<Long> institutions = new HashSet<Long>()
            for(String id: splitInstitutions) {
                def institutionId = id.toLong()
                institutions.add(institutionId)
            }
            if (ig.crossCutting) {
                def required = findDefaultInstitutionForGroup(ig)
                return new InstitutionFilter(institutions, required.id)
            } else {
                return new InstitutionFilter(institutions)
            }
        }
    }

    def addToInstitutions(InstitutionGroup group, Institution institution){
        institutionService.save(institution)
        group.addToInstitutions(institution)
    }

    def retrieveInstitutions(InstitutionGroup group){
        return group.institutions
    }

}
