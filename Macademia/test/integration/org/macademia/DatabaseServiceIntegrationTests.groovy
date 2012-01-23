package org.macademia

import grails.test.*
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class DatabaseServiceIntegrationTests extends GrailsUnitTestCase {
    def databaseService
    def collaboratorRequestService
    def similarityService
    def interestService
    def personService
    def institutionService

    protected void setUp() {
        super.setUp()
        databaseService.switchToCopyDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
        databaseService.clearCache()
    }

    protected void tearDown() {
        super.tearDown()
        databaseService.dropCurrentDB()
        databaseService.changeDB((String)ConfigurationHolder.config.dataSource.mongoDbName)
    }

    void testAddUser(){
        similarityService.buildInterestRelations(interestService.findByText("web2.0"))
        similarityService.buildInterestRelations(interestService.findByText("online communities"))
        similarityService.buildInterestRelations(interestService.findByText("social networking"))
        databaseService.addUser(Person.findByEmail("ssen@macalester.edu"))
        assertTrue(databaseService.getUserInstitutions(1).contains(Institution.findByName("Macalester College").id))
        Set<Long> interests = databaseService.getUserInterests(1)
        assertEquals(interests.size(),15)
        assertEquals(interestService.findByText("online communities").text,"online communities")
    }

//    /*
    void testGetUserInstitution() {
        //databaseService.addUser(Person.findByEmail("ssen@macalester.edu"))
        assertTrue(databaseService.getUserInstitutions(1).contains(Institution.findByName("Macalester College").id))
    }

    void testGetUserInterests() {
        Set<Long> interestSet = databaseService.getUserInterests(1)
        ArrayList<Long> interests = new ArrayList<Long>();
        interests.addAll(interestSet);
        interests.sort()
        for (int i = 0; i < 15; i++) {
            assertEquals(interests.get(i), i + 1)
        }
        assertEquals(interests.size(),15)
        assertEquals(interests.get(1),2)
        assertEquals(interests.get(12),13)
    }

    /**
     * Test to see if the "addToInterests()" method works by adding similar interests to "web2.0"
     * Also tests if removeLowestSimilarity works
     */
    void testAddToInterests() {
        int sizeOne = databaseService.getSimilarInterests(interestService.findByText("web2.0")).size()
        databaseService.addToInterests(interestService.findByText("web2.0"),interestService.findByText("social networking"),0.01812)
        assertEquals(databaseService.getSimilarInterests(interestService.findByText("web2.0")).size(), sizeOne+1)
        databaseService.addToInterests(interestService.findByText("web2.0"),interestService.findByText("ngos"),0.01812)
        assertEquals(databaseService.getSimilarInterests(interestService.findByText("web2.0")).size(), sizeOne+2)
    }

    void testAddCollaboratorRequests(){
        CollaboratorRequest rfc = new CollaboratorRequest(title:"Test RFC", description:"This is a test request for collaboratorRequest", creator:Person.findById(5), dateCreated: new Date(), expiration: new Date())
        rfc.addToKeywords(interestService.findByText("web2.0"))
        rfc.addToKeywords(interestService.findByText("social networking"))
        collaboratorRequestService.save(rfc)
        long id = CollaboratorRequest.findByCreator(rfc.creator).id
        for (Institution creatorInstitution: rfc.creator.memberships.institution) {
            assertTrue(databaseService.getCollaboratorRequestInstitutions(id).contains(creatorInstitution.id))
        }
        assertEquals(databaseService.getCollaboratorRequestCreator(id), rfc.creator.id)
        assertEquals(databaseService.getRequestKeywords(id).size(),2)
        databaseService.removeCollaboratorRequest(rfc)
    }


    void testAddRemoveInterests() {
        InstitutionGroup ig = new InstitutionGroup(name:"Test", abbrev:"tst")
        Institution instOne = new Institution(name: "Test One", emailDomain: "@testOne.edu", webUrl: "www.testingOne.edu", institutionGroups: [ig])
        Institution instTwo = new Institution(name: "Test Two", emailDomain: "@testTwo.edu", webUrl: "www.testingTwo.edu", institutionGroups: [ig])
        Institution instThree = new Institution(name: "Test Three", emailDomain: "@testThree.edu", webUrl: "www.testingThree.edu", institutionGroups: [ig])
        ig.addToInstitutions(instOne)
        ig.addToInstitutions(instTwo)
        ig.addToInstitutions(instThree)

        Person one = new Person(fullName: "One Institution", department: "Testing", email: "testOne@testing.edu", passwdHash: "asdfjkl", token: '123456789')
        Person two = new Person(fullName: "Two Institutions", department: "Testing", email: "testTwo@testing.edu", passwdHash: "lkjfdsa", token: '987654321')
        Person twoMatch = new Person(fullName: "Shares iTwo", department: "Testing", email: "testTwoMatch@testing.edu", passwdHash: "asdflkj", token: '567891234')
        Person three = new Person(fullName: "Three Institutions", department: "Testing", email: "testThree@testing.edu", passwdHash: "lkjfdsa", token: '543216789')
        CollaboratorRequest threeMatch = new CollaboratorRequest(title: "Shares iThree", description: "testing", creator: two, expiration: new Date())

        Interest iOne = interestService.analyze("testing one")
        Interest iTwo = interestService.analyze("testing two")
        Interest iThree = interestService.analyze("testing three")

        one.addToInterests(iOne)
        two.addToInterests(iTwo)
        twoMatch.addToInterests(iTwo)
        three.addToInterests(iThree)
        threeMatch.addToKeywords(iThree)

        ig.save()
        institutionService.save(instOne)
        institutionService.save(instTwo)
        institutionService.save(instThree)
        personService.save(one, [instOne])
        personService.save(two, [instOne, instTwo])
        personService.save(twoMatch, [instTwo])
        personService.save(three, [instOne, instTwo, instThree])
        collaboratorRequestService.save(threeMatch)

        // test that the interests were added to the proper institutions
        assertTrue(databaseService.getInstitutionInterests(instOne.id).contains(iOne.id))
        assertFalse(databaseService.getInstitutionInterests(instTwo.id).contains(iOne.id))
        assertFalse(databaseService.getInstitutionInterests(instThree.id).contains(iOne.id))

        assertTrue(databaseService.getInstitutionInterests(instOne.id).contains(iTwo.id))
        assertTrue(databaseService.getInstitutionInterests(instTwo.id).contains(iTwo.id))
        assertFalse(databaseService.getInstitutionInterests(instThree.id).contains(iTwo.id))

        assertTrue(databaseService.getInstitutionInterests(instOne.id).contains(iThree.id))
        assertTrue(databaseService.getInstitutionInterests(instTwo.id).contains(iThree.id))
        assertTrue(databaseService.getInstitutionInterests(instThree.id).contains(iThree.id))

        // test that removing the interests removes them from the proper institutions
        databaseService.removeInterestFromUser(iOne.id, one.id)
        assertFalse(databaseService.getInstitutionInterests(instOne.id).contains(iOne.id))
        assertFalse(databaseService.getInstitutionInterests(instTwo.id).contains(iOne.id))
        assertFalse(databaseService.getInstitutionInterests(instThree.id).contains(iOne.id))

        databaseService.removeInterestFromUser(iTwo.id, two.id)
        assertFalse(databaseService.getInstitutionInterests(instOne.id).contains(iTwo.id))
        assertTrue(databaseService.getInstitutionInterests(instTwo.id).contains(iTwo.id))
        assertFalse(databaseService.getInstitutionInterests(instThree.id).contains(iTwo.id))

        databaseService.removeInterestFromUser(iThree.id, three.id)
        assertTrue(databaseService.getInstitutionInterests(instOne.id).contains(iThree.id))
        assertTrue(databaseService.getInstitutionInterests(instTwo.id).contains(iThree.id))
        assertFalse(databaseService.getInstitutionInterests(instThree.id).contains(iThree.id))

        databaseService.removeInterestFromUser(iTwo.id, twoMatch.id)
        assertFalse(databaseService.getInstitutionInterests(instTwo.id).contains(iTwo.id))

        databaseService.removeKeywordFromRequest(iThree.id, threeMatch.id)
        assertFalse(databaseService.getInstitutionInterests(instOne.id).contains(iThree.id))
        assertFalse(databaseService.getInstitutionInterests(instTwo.id).contains(iThree.id))
    }

}