package org.macademia.nbrviz

class SurveyService {

    static transactional = true

    /**
     * Saves a subjects responses to a set of SurveyQuestions.
     * @param subject The Subject whose responses are to be saved.
     * @param responses A Map of responses, mapping a question
     * number to the subjects response to that question.
     */
    def saveResponse(Subject subject, Map responses) {
        
    }

    /**
     * Checks if the parameter Subject has completed the full survey.
     * @param subject The Subject whose completion is to be checked.
     * @return true if the Subject completed the survey, false otherwise.
     */
    def checkFinished(Subject subject) {
        for (SurveyPage page : SurveyPage.list()) {
            for (SurveyQuestion question : page.surveyQuestions) {
                if (!SurveyResponse.findBySubjectAndQuestion(subject, question)) {
                    return false
                }
            }
        }
        return true
    }
}
