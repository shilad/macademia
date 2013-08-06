package org.macademia.vizSurvey

import org.macademia.Person

class Survey {

    SurveyPerson surveyPerson
    Boolean consent = false
    Boolean completedSurvey = false
    String task
    String visualization
    String root

    static constraints = {
        person(nullable: true)
        task(nullable: true)
        visualization(nullable: true)
        root(nullable: true)
    }
}
