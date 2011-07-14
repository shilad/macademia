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

    /**
     * @param person The Person to be saved.
     * @param institutions A Collection<Institution> giving all of
     * the Institutions that the person should be a member of. The
     * first Institution in the Collection will be set as the Person's
     * primary Institution.
     */
    public void save(Person person, Collection<Institution> institutions) {
        //Maps wrong interest to right interest
        Map<Interest,Interest> replace = new HashMap<Interest,Interest>()
        //log.info("$person.interests[0]")

        for (Interest interest in person.interests) {
            Interest existingInterest = interestService.findByText(interest.text)
            if (!existingInterest) {
                // brand new interest
                interestService.save(interest)
            } else if (interest.id == null) {
                // interest with same text exists, schedule it for replacement
                replace.put(interest, existingInterest)
            } else if (interest.lastAnalyzed == null) {
                // existing interest, but not analyzed yet
                interestService.save(interest)
            }
        }
        for (Interest interest in replace.keySet()) {
            person.removeFromInterests(interest)
            person.addToInterests(replace.get(interest))
        }

        setMemberships(person, institutions)
        setPrimaryMembership(person, institutions.iterator().next())
        
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

}
