import org.macademia.nbrviz.SurveyPage
import org.macademia.nbrviz.SurveyQuestion
import org.macademia.Utils

def agreementScale = ["Stongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]

SurveyPage.withTransaction {
    def page1 = new SurveyPage(pageNumber: 1)
    def q1 = new SurveyQuestion(questionNumber: 1,
            abbrev: "first",
            question: "This is the first question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale,
            responseRequired: true)
    def q2 = new SurveyQuestion(questionNumber: 2,
            abbrev: "second",
            question: "This is the second question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale,
            responseRequired: true)
    def q3 = new SurveyQuestion(questionNumber: 3,
            abbrev: "third",
            question: "This is the third question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale,
            responseRequired: true)
    def q4 = new SurveyQuestion(questionNumber: 4,
            abbrev: "fourth",
            question: "This is the fourth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale,
            responseRequired: true)
    def q5 = new SurveyQuestion(questionNumber: 5,
            abbrev: "fifth",
            question: "This is the fifth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale,
            responseRequired: true)
    def q6 = new SurveyQuestion(questionNumber: 6,
            abbrev: "sixth",
            question: "This is the sixth question",
            responseType: SurveyQuestion.CHECKBOX,
            subDescriptors: ["response a", "response b", "response c", "response d"])
    def q7 = new SurveyQuestion(questionNumber: 7,
            abbrev: "seventh",
            question: "This is the seventh question",
            responseType: SurveyQuestion.CHECKBOX,
            subDescriptors: ["response a", "response b", "response c", "response d", "response e", "response f"])
    def q8 = new SurveyQuestion(questionNumber: 8,
            abbrev: "eighth",
            question: "This is the eighth question",
            responseType: SurveyQuestion.WRITTEN)

    [q1, q2, q3, q4, q5, q6, q7, q8].each({
        page1.addToQuestions(it)
    })
    Utils.safeSave(page1, true)

    def page2 = new SurveyPage(pageNumber: 2)
    def q9 = new SurveyQuestion(questionNumber: 9,
            abbrev: "ninth",
            question: "This is the ninth question",
            responseType: SurveyQuestion.CHECKBOX,
            subDescriptors: ["response a", "response b", "response c", "response d"],
            responseRequired: true)
    def q10 = new SurveyQuestion(questionNumber: 10,
            abbrev: "tenth",
            question: "This is the tenth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: ["response a", "response b", "response c", "response d"],
            responseRequired: true)
    def q11 = new SurveyQuestion(questionNumber: 11,
            abbrev: "eleventh",
            question: "This is the eleventh question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale)
    def q12 = new SurveyQuestion(questionNumber: 12,
            abbrev: "twelth",
            question: "This is the twelth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale)
    def q13 = new SurveyQuestion(questionNumber: 13,
            abbrev: "thirteenth",
            question: "This is the thirteenth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale)
    def q14 = new SurveyQuestion(questionNumber: 14,
            abbrev: "fourteenth",
            question: "This is the fourteenth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale)
    def q15 = new SurveyQuestion(questionNumber: 15,
            abbrev: "fifteenth",
            question: "This is the fifteenth question",
            responseType: SurveyQuestion.RADIO,
            subDescriptors: agreementScale)
    def q16 = new SurveyQuestion(questionNumber: 16,
            abbrev: "sixteenth",
            question: "This is the sixteenth question",
            responseType: SurveyQuestion.WRITTEN)
    def q17 = new SurveyQuestion(questionNumber: 17,
            abbrev: "seventeenth",
            question: "This is the seventeenth question",
            responseType: SurveyQuestion.WRITTEN)

    [q9, q10, q11, q12, q13, q14, q15, q16, q17].each({
        page2.addToQuestions(it)
    })
    Utils.safeSave(page2, true)
}