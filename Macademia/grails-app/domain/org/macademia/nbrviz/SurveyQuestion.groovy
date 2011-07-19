package org.macademia.nbrviz

class SurveyQuestion implements Comparable {

    public static final Integer RADIO = 0
    public static final Integer CHECKBOX = 1
    public static final Integer WRITTEN = 2

    Integer questionNumber
    String question
    String abbrev
    Integer responseType
    List<String> subDescriptors
    Boolean responseRequired = false

    static belongsTo = [page:SurveyPage]

    static hasMany = [subDescriptors: String]

    static constraints = {
        questionNumber(unique: true)
        subDescriptors(nullable: true)
    }

    public String toString() {
        return "question #${questionNumber}, ${abbrev}: ${question}"
    }

    public int hashCode() {
        return questionNumber.hashCode()
    }

    public boolean equals(Object other) {
        if (other instanceof SurveyQuestion) {
            return (other.questionNumber == this.questionNumber)
        }
        return false
    }

    public int compareTo(Object other) throws RuntimeException {
        if (other instanceof SurveyQuestion) {
            return questionNumber.compareTo(other.questionNumber)
        } else {
            throw new RuntimeException("Attempted to compare a SurveyQuestion to a nonSurveyQuestion object")
        }
    }

}
