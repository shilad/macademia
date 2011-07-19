package org.macademia.nbrviz

import org.macademia.Person
import org.macademia.Interest

class Subject {

    Person person
    Boolean consent = false
    Integer currentPage = 0
    Boolean completedSurvey = false
    String token

    static hasMany = [interests: Interest]

    static constraints = {
        person(nullable: true)
        interests(nullable: true)
        token(nullable:false, blank:false, unique: true)
    }

    public String toString() {
        return "subject person:$person consent:$consent, is on page $currentPage"
    }

    public int hashCode() {
        return person.hashCode()
    }

    public int compareTo(Object other) {
        return person.compareTo(other)
    }

    public boolean equals(Object other) {
        if (other instanceof Subject) {
            return other.person.equals(person)
        }
        return false
    }

    public String interestsToString() {
        return interests.collect({it.text}).join(', ')
    }

}
