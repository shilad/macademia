package org.macademia.vizSurvey

import org.macademia.vizSurvey.SurveyPerson;
import org.macademia.vizSurvey.SurveyInterest;

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
