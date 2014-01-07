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


    static hasMany = [questions: Question]

    static constraints = {
        task(nullable: true)
        visualization(nullable: true)
        root(nullable: true)
        recap(nullable: true)
        questions(nullable: true)
    }

    def Survey(SurveyPerson surveyPerson) {
        this.surveyPerson = surveyPerson
        this.consent = false
        this.completedSurvey = false
    }
}
