package org.macademia

import org.macademia.vizSurvey.Survey

class VizSurveyController {

    def surveyPersonService

    def consent() {
        String email = params.email
        if (email != null) {
            Person p = surveyPersonService.create(email)
        }
        render(view:'consent')
    }

    def consentSave() {
        if (!params.email) {
            redirect(url: "/all" + this.getControllerUri() + '/consent')
            return
        }
        Person p = surveyPersonService.create(email)
        Survey s = new Survey()
        s.setPerson(p)
        s.setConsent(params.consent)
        s.save(flush: true)

        redirect(action: 'interest')
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
