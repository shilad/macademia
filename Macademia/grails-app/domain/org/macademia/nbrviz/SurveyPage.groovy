package org.macademia.nbrviz

class SurveyPage {

    Integer pageNumber
    List<SurveyQuestion> questions

    static hasMany = [questions: SurveyQuestion]

    public String toString() {
        return "page #${pageNumber}, question: ${questions}"
    }

    public int hashCode() {
        return pageNumber.hashCode()
    }

    public boolean equals(Object other) {
        if (other instanceof SurveyPage) {
            return (other.pageNumber == this.pageNumber)
        }
        return false
    }

    public int compareTo(Object other) throws RuntimeException {
        if (other instanceof SurveyPage) {
            return pageNumber.compareTo(other.pageNumber)
        } else {
            throw new RuntimeException("Attempted to compare a SurveyPage to a nonSurveyPage object")
        }
    }

}
