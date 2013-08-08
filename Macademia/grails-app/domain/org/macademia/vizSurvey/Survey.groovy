package org.macademia.vizSurvey

import org.macademia.Person

class Survey {

    SurveyPerson surveyPerson
    Boolean consent = false
    Boolean completedSurvey = false
    String task
    String visualization
    String root
    String recap


    static hasMany = [questions: SurveyQuestion]

    static constraints = {
        surveyPerson(nullable: true)
        task(nullable: true)
        visualization(nullable: true)
        root(nullable: true)
        recap(nullable: true)
        question(nullable: true)
    }
}
