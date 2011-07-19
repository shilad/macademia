package org.macademia.nbrviz

import org.macademia.Person

class VisualizationData {

    String name
    List<Person> choices
    List<SurveyQuestion> choiceQuestions
    List<SurveyQuestion> vizQuestions

    static hasMany = [
            choices: Person,
            choiceQuestion: SurveyQuestion,
            vizQuestions: SurveyQuestion
    ]

    static constraints = {
    }
}
