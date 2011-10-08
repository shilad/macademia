package org.macademia

import edu.macalester.acs.AutocompleteTree
import edu.macalester.acs.AutocompleteEntry
import org.hibernate.SessionFactory

/**
 * Created by IntelliJ IDEA.
 * User: equeirosnunes, shilad
 * This is a wrapper for the autocomplete plugin
 */
class AutocompleteService{

    public static class GroupTree {
        AutocompleteTree<Long, AutocompleteEntity> institutionTree = new AutocompleteTree<Long, AutocompleteEntity>()
        AutocompleteTree<String, AutocompleteEntity> interestTree = new AutocompleteTree<String, AutocompleteEntity>()
        AutocompleteTree<String, AutocompleteEntity> overallTree = new AutocompleteTree<String, AutocompleteEntity>()
        AutocompleteTree<String, AutocompleteEntity> relatedInterests = new AutocompleteTree<String, AutocompleteEntity>()
    }

    //this is the maximum number of autocomplete results
    static int MAX_NUMBER_RES = 10

    Map<String, GroupTree> groupTrees = [:]
    SessionFactory sessionFactory
    InstitutionGroupService institutionGroupService
    DatabaseService databaseService

    def init() {

        for (InstitutionGroup ig : InstitutionGroup.list()) {
            getTree(ig.abbrev).institutionTree.clear()
            getTree(ig.abbrev).interestTree.clear()
            getTree(ig.abbrev).overallTree.clear()
        }

        log.info("processing autocomplete people and interests...")
        Person.findAll().each { updatePerson(it) }
        log.info("processing autocomplete institution...")
        Institution.findAll().each { addInstitution(it) }
        log.info("processing autocomplete collaborator requests...")
        CollaboratorRequest.findAll().each { addRequest(it) }

    }

    GroupTree getTree(String abbrev) {
        GroupTree t = groupTrees.get(abbrev)
        if (t == null) {
            t = new GroupTree()
            groupTrees[abbrev] = t
        }
        return t
    }

    GroupTree getTree() {
        return getTree(MacademiaConstants.GROUP_ALL)
    }

    def updatePerson(Person person) {
        if (person.invisible) {
            // Remove an invisible person if that person is already in autocomplete (or nothing will happen)
            removePerson(person)
            return
        }
        Set<InstitutionGroup> igs = [] as Set
        for (Institution institution : person.memberships.institution) {
            igs.addAll(institutionGroupService.findAllByInstitution(institution))
        }
        for (InstitutionGroup ig : igs) {
//            println("adding person ${person.fullName} to group ${ig.abbrev}")
            GroupTree gt = getTree(ig.abbrev)
            String nodeName = gt.overallTree.get("p" + person.id)?.getValue()?.name
            if( nodeName != person.fullName && nodeName != null ) {
                // If Person's fullName has changed, remove them from AutoCompleteTree
                gt.overallTree.remove("p" + person.id)
            }
            def institution = person.retrievePrimaryInstitution().toShortString()
            if (!gt.overallTree.contains("p" + person.id)) {
                // If tree does not contain Person, add them
                def entity1 = new AutocompleteEntity(person.id, person.fullName, Person.class, institution)
                gt.overallTree.add("p" + person.id, entity1)
            } else if(gt.overallTree.get("p" + person.id).getValue().other != institution) {
                // If Person's Institution's name has changed, update it
                gt.overallTree.get("p" + person.id).getValue().setOther(institution)
            }
            for (Interest interest : person.interests) {
                addInterest(interest, gt)
            }
        }
    }

    def addInterest(Interest interest, GroupTree gt) {
        def entity = new AutocompleteEntity(interest.id, interest.text, Interest.class)
        if (!gt.overallTree.contains("i" + interest.id)) {
            gt.overallTree.add("i" + interest.id, entity)
        }
        if (!gt.interestTree.contains("i" + interest.id)) {
            gt.interestTree.add("i" + interest.id, entity)
        }
        int usage = databaseService.getInterestUsage(interest.id)
        if (interest.articleName && interest.getNormalizedText() == Interest.normalize(interest.articleName)) {
            usage += 1
        }
        gt.overallTree.get("i" + interest.id).setScore(usage)
        gt.interestTree.get("i" + interest.id).setScore(usage)
        if (databaseService.getSimilarInterests(interest).size() > 5) {
            gt.relatedInterests.add("i" + interest.id, entity)
        }
    }

    public int getInterestCount(Long interestId) {
        AutocompleteEntry ae = getTree().interestTree.get("i" + interestId)
        return (ae == null) ? 0 : ae.scoreAsInt
    }

    def addInstitution(Institution institution) {
        def entity = new AutocompleteEntity(institution.id, institution.name, Institution.class, institution.webUrl)
        Collection<InstitutionGroup> igs = institutionGroupService.findAllByInstitution(institution)
        for (InstitutionGroup ig : igs) {
            getTree(ig.abbrev).institutionTree.add(institution.id, entity)
        }
    }
    def addRequest(CollaboratorRequest collaboratorRequest) {
        def entity = new AutocompleteEntity(collaboratorRequest.id, collaboratorRequest.title, CollaboratorRequest.class)
        Collection<InstitutionGroup> igs = collaboratorRequest.creator.retrieveInstitutionGroups()
        for (InstitutionGroup ig : igs) {
            getTree(ig.abbrev).overallTree.add("r"+ collaboratorRequest.id, entity)
        }
    }

    public def removePerson(Person person) {
        Collection<InstitutionGroup> igs = person.retrieveInstitutionGroups()
        for (InstitutionGroup ig : igs) {
            getTree(ig.abbrev).overallTree.remove("p" + person.id)
        }
    }
    public def removeInterest(Person owner, Long interestId) {
        Collection<InstitutionGroup> igs = owner.retrieveInstitutionGroups()
        for (InstitutionGroup ig : igs) {
            getTree(ig.abbrev).overallTree.remove("i"+ interestId)
        }
    }

    public def removeRequest(CollaboratorRequest request) {
        Collection<InstitutionGroup> igs = request.creator.retrieveInstitutionGroups()
        for (InstitutionGroup ig : igs) {
            getTree(ig.abbrev).overallTree.remove("r"+ request.id)
        }
    }

    Collection<AutocompleteEntity> getInstitutionAutocomplete(String group, String query, int maxResults) {
        List<AutocompleteEntity> institutions = new ArrayList<AutocompleteEntity>()
        SortedSet<AutocompleteEntry<Long, AutocompleteEntity>> results = getTree(group).institutionTree.autocomplete(query, maxResults)
        for (AutocompleteEntry<Long, AutocompleteEntity> entry: results) {
            institutions.add(entry.getValue() as AutocompleteEntity)
        }
        return institutions
    }

    Collection<AutocompleteEntity> getRelatedInterestAutocomplete(String group, String query, int maxResults) {
        List<AutocompleteEntity> interests = new ArrayList<AutocompleteEntity>()
        SortedSet<AutocompleteEntry<String, AutocompleteEntity>> results = getTree(group).relatedInterests.autocomplete(query, maxResults)
        for (AutocompleteEntry<String, AutocompleteEntity> entry: results) {
            interests.add(entry.getValue() as AutocompleteEntity)
        }
        return interests
    }

    Collection<AutocompleteEntity> getInterestAutocomplete(String group, String query, int maxResults) {
        List<AutocompleteEntity> interests = new ArrayList<AutocompleteEntity>()
        SortedSet<AutocompleteEntry<String, AutocompleteEntity>> results = getTree(group).interestTree.autocomplete(query, maxResults)
        for (AutocompleteEntry<String, AutocompleteEntity> entry: results) {
            interests.add(entry.getValue() as AutocompleteEntity)
        }
        return interests
    }
    Map<Class, Collection<AutocompleteEntity>> getOverallAutocomplete(String group, String query, int maxResults) {
        Map<Class, Collection<AutocompleteEntity>> result = [:]
        SortedSet<AutocompleteEntry<String, AutocompleteEntity>> results = getTree(group).overallTree.autocomplete(query, maxResults)
        for (AutocompleteEntry<String, AutocompleteEntity> entry: results) {
            AutocompleteEntity entity = entry.getValue()
            if (!result.containsKey(entity.getKlass())) {
                result[entity.getKlass()] = []
            }
            result[entity.getKlass()].add(entity)
        }
        return result
    }
}



