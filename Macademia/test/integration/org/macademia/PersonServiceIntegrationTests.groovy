package org.macademia

import grails.test.GrailsUnitTestCase
import org.codehaus.groovy.grails.commons.ConfigurationHolder

/**
 * Created by IntelliJ IDEA.
 * User: aschneem
 * Date: Jun 8, 2010
 * Time: 1:07:29 PM
 * To change this template use File | Settings | File Templates.
 */
class PersonServiceIntegrationTests extends GrailsUnitTestCase {
    def personService
    def databaseService
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

    void testSave(){
        InstitutionGroup acm = new InstitutionGroup(name:"Associated Colleges of the Midwest", abbrev:"acm")
        Institution mac = new Institution(name: "Macalester", emailDomain: "@macalester.edu", webUrl: "www.macalestertest.edu", institutionGroups: [acm])
        institutionService.save(mac)
        Person p = new Person(fullName:"Alicia Johnson",email:"ajohns24@macalester.edu",department:"Mathematics, Statistics, and Computer Science")
        Interest i1 = new Interest("statistics")
        Interest i2 = new Interest("applied statistics")
        Interest i3 = new Interest("probability")
        Interest i4 = new Interest("Markov chain Monte Carlo")
        Interest i5 = new Interest("public health")
        assertEquals(Interest.findAllByText("Markov chain Monte Carlo").size(),0)
        p.addToInterests(i1)
        p.addToInterests(i2)
        p.addToInterests(i3)
        p.addToInterests(i4)
        p.addToInterests(i5)
        assertTrue(Person.findByEmail("ajohns24@macalester.edu")==null)
        personService.create(p, 'foobar', [mac])
        assertTrue(Person.findByEmail("ajohns24@macalester.edu")!=null)
        assertTrue(Interest.findByText("Markov chain Monte Carlo")!=null)
    }

    void testUpdate() {
        InstitutionGroup acm = InstitutionGroup.findByAbbrev("acm")
        Institution mac = new Institution(name: "Macalester", emailDomain: "@mac.edu", webUrl: "www.macalestertest.edu", institutionGroups: [acm])
        Institution carl = new Institution(name: "Carleton", emailDomain: "@carl.edu", webUrl: "www.carltest.edu", institutionGroups: [acm])
        Institution tom = new Institution(name: "Thomas", emailDomain: "@tom.edu", webUrl: "www.tomtest.edu", institutionGroups: [acm])
        institutionService.save(mac)
        institutionService.save(carl)
        institutionService.save(tom)
        Interest i1 = new Interest("statistics")
        Interest i2 = new Interest("applied statistics")
        Interest i3 = new Interest("probability")
        Person p = new Person(fullName:"Alicia Johnson",email:"ajohns24@macalester.edu",department:"Mathematics, Statistics, and Computer Science")

        // test create
        p.addToInterests(i1)
        personService.create(p, 'foobar', [mac])
        assertEquals(p.memberships.size(), 1)
        assertTrue(p.memberships.institution.contains(mac))
        assertFalse(p.memberships.institution.contains(carl))
        assertFalse(p.memberships.institution.contains(tom))
        assertEquals(mac.memberships.size(), 1)
        assertEquals(carl.memberships.size(), 0)
        assertEquals(tom.memberships.size(), 0)
        assertEquals(p.interests.size(), 1)
        assertTrue(p.interests.contains(i1))
        assertFalse(p.interests.contains(i2))
        assertFalse(p.interests.contains(i3))

        // test change interests
        p.removeFromInterests(i1)
        p.addToInterests(i2)
        personService.save(p)
        assertEquals(p.memberships.size(), 1)
        assertTrue(p.memberships.institution.contains(mac))
        assertFalse(p.memberships.institution.contains(carl))
        assertFalse(p.memberships.institution.contains(tom))
        assertEquals(mac.memberships.size(), 1)
        assertEquals(carl.memberships.size(), 0)
        assertEquals(tom.memberships.size(), 0)
        assertEquals(p.interests.size(), 1)
        assertFalse(p.interests.contains(i1))
        assertTrue(p.interests.contains(i2))
        assertFalse(p.interests.contains(i3))

        // test change institutions
        personService.save(p, [mac, carl])
        assertEquals(p.memberships.size(), 2)
        assertTrue(p.memberships.institution.contains(mac))
        assertTrue(p.memberships.institution.contains(carl))
        assertFalse(p.memberships.institution.contains(tom))
        assertEquals(mac.memberships.size(), 1)
        assertEquals(carl.memberships.size(), 1)
        assertEquals(tom.memberships.size(), 0)
        assertEquals(p.interests.size(), 1)
        assertFalse(p.interests.contains(i1))
        assertTrue(p.interests.contains(i2))
        assertFalse(p.interests.contains(i3))

        // test change institutions and interests
        p.removeFromInterests(i2)
        p.addToInterests(i3)
        personService.save(p, [carl, tom])
        assertEquals(p.memberships.size(), 2)
        assertFalse(p.memberships.institution.contains(mac))
        assertTrue(p.memberships.institution.contains(carl))
        assertTrue(p.memberships.institution.contains(tom))
        assertEquals(mac.memberships.size(), 0)
        assertEquals(carl.memberships.size(), 1)
        assertEquals(tom.memberships.size(), 1)
        assertEquals(p.interests.size(), 1)
        assertFalse(p.interests.contains(i1))
        assertFalse(p.interests.contains(i2))
        assertTrue(p.interests.contains(i3))
    }

    void testFindByInstitution() {
        InstitutionGroup acm = new InstitutionGroup(name:"Associated Colleges of the Midwest", abbrev:"acm")
        Institution mac = new Institution(name: "Macalester", emailDomain: "@macalester.edu", webUrl: "www.macalestertest.edu", institutionGroups: [acm])
        Institution car = new Institution(name: "Carleton", emailDomain: "@carleton.edu", webUrl: "www.carltest.edu", institutionGroups: [acm])
        Person p = new Person(fullName:"Alicia Johnson",email:"ajohns24@macalester.edu",department:"Mathematics, Statistics, and Computer Science")
        Person p2 = new Person(fullName:"Not Alicia Johnson",email:"ajohns24@carltest.edu",department:"Mathematics, Statistics, and Computer Science")
        institutionService.save(mac)
        institutionService.save(car)
        personService.create(p, "pP@sswd", [mac])
        personService.create(p2, "p2P@sswd", [mac,car])
        assertTrue(personService.findAllInInstitution(mac).containsAll([p,p2]))
    }

}
