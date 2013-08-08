package org.macademia.vizSurvey


class SurveyPersonService {
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
}
