package org.macademia.vizSurvey

class SurveyInterest {

    String text

    static belongsTo = [surveyPerson:SurveyPerson]

    static constraints = {
    }

    SurveyInterest(String text) {
        this.text = text
    }


}
