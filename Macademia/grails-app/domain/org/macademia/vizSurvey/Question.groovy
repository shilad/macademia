package org.macademia.vizSurvey

class Question {

    Integer score
    String question

    static belongsTo = [survey:Survey]


    static constraints = {
    }
}
