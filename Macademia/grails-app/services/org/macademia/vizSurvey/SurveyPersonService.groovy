package org.macademia.vizSurvey

class SurveyPersonService {
        def create(String email) {
            SurveyPerson p = new SurveyPerson()
            p.setEmail(email)
            p.save(flush: true)
        }
}
