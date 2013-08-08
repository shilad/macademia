package org.macademia.vizSurvey

class SurveyInterest {

    String text
    Boolean isRoot = false

    static belongsTo = [surveyPerson:SurveyPerson]

    static constraints = {
        isRoot(nullable: true)
        text(nullable: true)
    }

    SurveyInterest(String text) {
        this.text = text
    }


}
