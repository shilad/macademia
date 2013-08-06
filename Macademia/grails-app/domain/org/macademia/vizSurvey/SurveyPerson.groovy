package org.macademia.vizSurvey

import org.macademia.Interest

class SurveyPerson {

    String email

    static hasMany = [interests: Interest]

    static constraints = {
        interests(nullable: true)
    }
}
