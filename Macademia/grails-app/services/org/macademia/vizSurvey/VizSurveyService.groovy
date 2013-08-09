package org.macademia.vizSurvey


class VizSurveyService {
    def create(String email) {
        SurveyPerson p = new SurveyPerson()
        p.setEmail(email)
        p.save(flush: true)
    }

    def createInterest(String text) {
        def interest = SurveyInterest.findByText(text)
        if (interest == null)
        {
            interest = new SurveyInterest(text)
        }
        return interest
    }

    def createQuestion(String text) {
        def question = Question.findByText(text)
        if (question == null) {
            question = new Question(text)
        }
        return question
    }

}
