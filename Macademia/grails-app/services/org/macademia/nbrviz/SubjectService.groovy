package org.macademia.nbrviz

import org.macademia.Utils
import org.macademia.Person

class SubjectService {

    static transactional = true

    /**
     * Creates a new Subject.
     * @param subject The Subject to be created.
     */
    public void create(Subject subject) {
        subject.token = Person.randomString(20)
        Utils.safeSave(subject, true)
    }

    /**
     * Finds the Subject with the parameter token.
     * @param token The String token identifying the desired Subject.
     * @return The Subject whose token matches the parameter.
     */
    public Subject findByToken(String token) {
        return Subject.findByToken(token)
    }

    /**
     * Saves a subjects responses to a set of SurveyQuestions.
     * @param subject The Subject whose responses are to be saved.
     * @param responses A Map of responses, mapping a question
     * number to the subject's response to that question.
     */
    public void saveResponse(Subject subject, Map responses) throws IllegalArgumentException {
        for (Integer key : responses.keySet()) {
            def response = new SurveyResponse(subject: subject,
                    question: SurveyQuestion.findByQuestionNumber(key))

            if (response.question.responseType == SurveyQuestion.RADIO) {
                response.radio = responses[key] as Integer
            } else if (response.question.responseType == SurveyQuestion.CHECKBOX) {
                for (String val : responses[key]) {
                    response.addToCheckbox(Integer.parseInt(val))
                }
            } else {
                response.written = responses[key]
            }
            if (!response.checkbox && (response.radio == null) && !response.written && response.question.responseRequired) {
                throw new IllegalArgumentException("response to question #${key} is required but wasn't found")
            }
            Utils.safeSave(response)
        }
    }

    /**
     * Checks if the parameter Subject has completed the full survey.
     * @param subject The Subject whose completion is to be checked.
     * @return true if the Subject has completed the survey, false
     * otherwise.
     */
    public boolean checkFinished(Subject subject) {
        if (subject.completedSurvey) {
            return true
        }
        for (SurveyPage page : SurveyPage.list()) {
            for (SurveyQuestion question : page.questions) {
                if (!SurveyResponse.findBySubjectAndQuestion(subject, question)) {
                    return false
                }
            }
        }
        return true
    }
    
}
