package org.macademia

class VizSurveyController {

    def consent() {
        render(view: 'consent')
    }

    def interest() {
        render(view: 'interest')
    }

    def instructions() {
        render(view: 'instructions')
    }

    def recap() {
        render(view: 'recapt')
    }

    def index() {
        render('Hello, world!')
    }

}
