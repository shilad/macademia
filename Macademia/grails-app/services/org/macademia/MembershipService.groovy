package org.macademia

/**
 * Authors: Brandon Maus
 */
class MembershipService {

    static transactional = true

    /**
     * Creates a new Membership between the Person and Institution.
     */
    def createMembership(Person person, Institution institution) {
        Membership membership = new Membership(person:person, institution:institution)
        person.addToMemberships(membership)
        institution.addToMemberships(membership)
        Utils.safeSave(person)
        Utils.safeSave(institution)
        Utils.safeSave(membership)
    }

    /**
     * Removes the Membership from both its Person and Institution, and
     * then deletes it from the database.
     */
    def removeMembership(Membership membership) {
        // bug: grails removeFrom does not work here
        membership.person.memberships.remove(membership)
        membership.institution.memberships.remove(membership)
        membership.delete()
    }

}
