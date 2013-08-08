package org.macademia.vizSurvey

class SurveyQuestion {

    Integer score
    String question

    static belongsTo = [survey:Survey]


    static constraints = {
    }
}
