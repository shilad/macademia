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
