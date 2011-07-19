package org.macademia.nbrviz

class RadioGroup {

    public List<SurveyQuestion> radioQuestions

    /**
     * Creates a new group of radio questions who share
     * a common set of subDescriptors.
     * @param question The first radio question of the
     * group. All other radio questions in the group will
     * have subDescriptors equal to this question.
     */
    public RadioGroup(SurveyQuestion question) {
        if (question.responseType == SurveyQuestion.RADIO) {
            radioQuestions = [question]
        }
        null
    }

    /**
     * Determines whether the parameter SurveyQuestion
     * belongs to this group of radio questions.
     * @param question The SurveyQuestion whose inclusion
     * is to be checked.
     * @return true if the parameter question belongs to
     * this group of radio questions, false otherwise.
     */
    public boolean isMember(SurveyQuestion question) {
        return (question.responseType == SurveyQuestion.RADIO) &&
                (radioQuestions.first().subDescriptors.equals(question.subDescriptors))
    }

    /**
     * Adds the parameter question to this group of radio
     * questions. If the question does not belong to this
     * group, no to the group is made.
     * @param question The SurveyQuestion who is to be
     * added to the group, if it belongs.
     */
    public void add(SurveyQuestion question) {
        if (isMember(question)) {
            radioQuestions.add(question)
        }
    }

    /**
     * Returns the common subDescriptors of the radioGroup.
     * @return A List<String> giving the common subDescriptors.
     */
    public List<String> getCommonSubDescriptors() {
        return radioQuestions.first().subDescriptors
    }

    public String toString() {
        return "common subDescriptors: ${radioQuestions.first().subDescriptors}, questions: ${radioQuestions}"
    }

}
