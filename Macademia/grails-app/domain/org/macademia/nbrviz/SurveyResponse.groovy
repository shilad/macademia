package org.macademia.nbrviz

class SurveyResponse {

    Subject subject
    SurveyQuestion question

    /* Only one of these should be non-null */
    Integer radio
    Set<Integer> checkbox
    String written

    static hasMany = [checkbox: Integer]

    static constraints = {
        question(unique: 'subject')
        radio(nullable: true)
        checkbox(nullable: true)
        written(nullable: true)
    }

    public String toString() {
        return "subject ${subject.id} response to #${question.questionNumber} : ${radio != null ? radio : ''} ${checkbox ? checkbox : ''} ${written ? written : ''}"
    }

    public int hashCode() {
        return subject.hashCode() + question.hashCode()
    }

    public boolean equals(Object other) {
        if (other instanceof SurveyResponse) {
            return (other.subject.equals(subject) && other.question.equals(question))
        }
        return false
    }

    public int compareTo(Object other) throws RuntimeException {
        if (other instanceof SurveyResponse) {
            def returnVal = subject.compareTo(other.subject)
            if (returnVal == 0) {
                returnVal = question.compareTo(other.question)
            }
            return returnVal
        } else {
            throw new RuntimeException("Attempted to compare a SurveryResponse to a nonSurveyResponse object")
        }
    }

}
