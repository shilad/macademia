package org.macademia.nbrviz

class SurveyService {

    static transactional = true

    /**
     * Formats the parameter page so that adjacent radio questions with
     * common subDescriptors are grouped together.
     * @param page The page to be formatted.
     * @return A List giving the result, containing either SurveyQuestions
     * for questions whose response type is written or checkbox and
     * RadioGroups for questions of response type radio.
     */
    public List groupRadios(SurveyPage page) {
        def questions = []
        if (page.questions.first().responseType == SurveyQuestion.RADIO) {
            questions.push(new RadioGroup(page.questions.first()))
        } else {
            questions.push(page.questions.first())
        }
        for (int i = 1; i < page.questions.size(); i++) {
            if (page.questions[i].responseType == SurveyQuestion.RADIO) {
                if ((questions.last() instanceof RadioGroup) && questions.last().isMember(page.questions[i])) {
                    questions.last().add(page.questions[i])
                } else {
                    questions.add(new RadioGroup(page.questions[i]))
                }
            } else {
                questions.add(page.questions[i])
            }
        }
        return questions
    }

    /**
     * Analyzes the survey responses, aggregating the total number
     * of responses subjects gave for each question.
     * @return A Map of the analyzed data.
     */
    public Map analyzeData() {
        def result = [:]
        for (SurveyQuestion question : SurveyQuestion.list()) {
            if (question.responseType == SurveyQuestion.WRITTEN) {
                result[question.questionNumber] = []
            } else {
                result[question.questionNumber] = [:]
            }
        }

        for (Subject subject : Subject.findAllByCompletedSurvey(true)) {
            for (SurveyResponse response : SurveyResponse.findAllBySubject(subject)) {
                int curQuestion = response.question.questionNumber
                if (response.question.responseType == SurveyQuestion.CHECKBOX) {
                    for (Integer ans : response.checkbox) {
                        if (result[curQuestion].containsKey(ans)) {
                            result[curQuestion][ans] = result[curQuestion][ans] + 1
                        } else {
                            result[curQuestion].put(ans, 1)
                        }
                    }
                } else if (response.question.responseType == SurveyQuestion.RADIO) {
                    if (result[curQuestion].containsKey(response.radio)) {
                        result[curQuestion][response.radio] = result[curQuestion][response.radio] + 1
                    } else {
                        result[curQuestion].put(response.radio, 1)
                    }
                } else {
                    result[curQuestion].add(response.written)
                }
            }
        }
        return result
    }
    
}
