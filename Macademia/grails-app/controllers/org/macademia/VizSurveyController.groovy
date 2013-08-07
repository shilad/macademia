package org.macademia

import org.macademia.vizSurvey.Survey
import org.macademia.vizSurvey.SurveyPerson

class VizSurveyController {

    def surveyPersonService

    def invite() {

        if (params.email == null) {
            params.email = "snaden@macalester.edu"
            params.baseUrl = "http://localhost:8080/Macademia/all/vizSurvey/consent"
            params.subject = "It works!"
        }

        sendMail {
            to params.email
            subject params.subject
            html view : 'email', model: [email:params.email, baseUrl: params.baseUrl]
        }

        redirect(url: "/all" + this.getControllerUri() + '/consent')
    }


    def consent() {
        String email = params.email
        if (email != null) {
            SurveyPerson p = surveyPersonService.create(email)
            session.person = p
        }

        render(view:'consent')
    }

    def consentSave() {
        if (!session.person) {
            redirect(url: "/all" + this.getControllerUri() + '/consent')
            return
        }
        Survey s = new Survey()
        s.setSurveyPerson(session.person)
        s.setConsent(params.consent)
        s.save(flush: true)

        redirect(url: "/all" + this.getControllerUri() + '/interest')
    }



    def interest() {
        render(view: 'interest')
    }

    def instructions() {
        render(view: 'instructions')
    }

    def vizTask(){
        render(view: 'comparisonSurvey')
    }

    def recap() {
        render(view: 'recap')
    }

    def index() {
        render('Hello, world!')
    }

}
