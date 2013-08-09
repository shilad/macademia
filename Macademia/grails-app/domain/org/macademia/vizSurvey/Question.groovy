package org.macademia.vizSurvey

class Question {

    Integer score
    String text

    static belongsTo = [survey:Survey]


    static constraints = {
        score(nullable: true)
    }

    Question(String text) {
        this.text = text
    }
}
