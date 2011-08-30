package org.macademia

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class PersonService {

    boolean transactional = true
    def MAX_DEPTH = 5
    def interestService
    def userService
    def databaseService
    def autocompleteService
    def collaboratorRequestService
    def membershipService

    public void cleanupPeople(){
        Set<Long> validIds = new HashSet<Long>(Person.list().collect({it.id}))
        databaseService.cleanupPeople(validIds)
    }

    def get(long id) {
        return Person.get(id)
    }

    def findByEmail(String email) {
        return Person.findByEmail(email)
    }

    def findByInterest(Interest i) {
        return i.people
    }

    public void create(Person person, String passwd, Collection<Institution> institutions) {
        person.passwdHash = Person.calculatePasswdHash(passwd)
        person.token = Person.randomString(20)
        save(person, institutions)
    }

    public void save(Person person) {
        this.save(person, person.memberships.institution)
    }

    public Collection<Person> findRandomPeopleWithImage(int n) {
        List<Long> ids = Person.findAllByImageSubpathNotIsNull().id as ArrayList<Long>
        Collections.shuffle(ids)
        if (ids.size() > n) {
            ids = ids.subList(0, n)
        }
        return Person.getAll(ids)
    }

    /**
     * Saves the parameter person. Requires that all of the parameter
     * person's interests have been analyzed first.
     * @param person The Person to be saved.
     * @param institutions A Collection<Institution> giving all of
     * the Institutions that the person should be a member of. The
     * first Institution in the Collection will be set as the Person's
     * primary Institution.
     */
    public void save(Person person, Collection<Institution> institutions) {
        setMemberships(person, institutions)
        setPrimaryMembership(person, institutions.iterator().next())
        Utils.safeSave(person)
        databaseService.addUser(person)
        autocompleteService.updatePerson(person)
    }

    public Person findByToken(String token) {
        return Person.findByToken(token)
    }

    public void delete(Person person){
        List deleteInterestsAndRequests = databaseService.removeUser(person.id)
        autocompleteService.removePerson(person)
        for (interest in deleteInterestsAndRequests[0]){
            interestService.delete(person, interest)
        }
        for (request in deleteInterestsAndRequests[1]){
            collaboratorRequestService.delete(CollaboratorRequest.get(request))
        }
        person.delete()
    }

    public Set<Person> findAllInInstitution(Institution i) {
        return i.memberships.person
    }

    /**
     * Sets the Person's Memberships to the parameter Institutions.
     * @param person The Person whose Membership data is being set.
     * @param institutions A Collection<Institution> giving the complete
     * set of all Institutions the Person is a member of.
     */
    def setMemberships(Person person, Collection<Institution> institutions) {
        // memToRemove holds Memberships the Person is no longer a member of
        if (!person.memberships) {
            person.memberships = [] as Set
        }
        Collection<Membership> memToRemove = []
        memToRemove.addAll(person.memberships)
        memToRemove.removeAll({institutions.contains(it.institution)})
        for (Membership membership : memToRemove) {
            // loop over Memberships to be removed
            membershipService.removeMembership(membership)
        }
        for (Institution institution : institutions) {
            if (!person.memberships.institution.contains(institution)) {
                // person has a new Membership
                membershipService.createMembership(person, institution)
            }
        }
    }

    /**
     * Sets the Person's primary membership to the parameter Institution,
     * creating the Membership if it does not already exist. Also ensures
     * that a Person can only have one primary Institution at a time.
     */
    def setPrimaryMembership(Person person, Institution institution) {
        if (!person.memberships.institution.contains(institution)) {
            membershipService.createMembership(person, institution)
        }
        person.memberships.each {
            it.primaryMembership = it.institution.equals(institution)
        }
    }

    /**
     * Assumes that a user doesn't belong to more than one institution in a group.
     * This is clearly wrong (e.g. for all), but probably harmless.
     * @param ig
     * @return
     */
    private int countMemberships(InstitutionGroup ig) {
        int n = 0
        for (Institution i : ig.institutions) {
            n += Membership.countByInstitution(i)
        }
        return n
    }

    def getInstitutionGroupCounts() {
        def igCounts = [:]
        for (InstitutionGroup ig : InstitutionGroup.findAll()) {
            igCounts[ig] = countMemberships(ig)
        }
        return igCounts
    }
}
