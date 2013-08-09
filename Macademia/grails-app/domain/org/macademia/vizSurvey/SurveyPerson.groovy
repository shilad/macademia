package org.macademia.vizSurvey

class SurveyPerson {

    String email

    static hasMany = [interests: SurveyInterest]

    static constraints = {
        interests(nullable: true)
    }
}
