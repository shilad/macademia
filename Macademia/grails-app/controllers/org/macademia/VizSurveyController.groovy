package org.macademia

import org.macademia.vizSurvey.Question
import org.macademia.vizSurvey.Survey
import org.macademia.vizSurvey.SurveyInterest
import org.macademia.vizSurvey.SurveyPerson

class VizSurveyController {

    def vizSurveyService

    def invite() {
        if (params.email == null) {
            params.email = "mgiesel@macalester.edu"
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
            SurveyPerson p = vizSurveyService.create(email)
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
        s.setConsent(params.get('consent'))
        s.save(flush: true)

        session.survey = s

        redirect(url: "/all" + this.getControllerUri() + '/interest')
    }


    def interest() {
        render(view: 'interest')
    }

    def interestSave() {
        List<String> inputs = params.('interest')
        SurveyPerson p = session.person
        for (int i=1; i<inputs.size();i++) {
            SurveyInterest interest = vizSurveyService.createInterest(inputs[i])
            if (i==1) {
                interest.setIsRoot(true)
            }
            p.addToInterests(interest)
        }
        p.save(flush:true)
        redirect(url: "/all" + this.getControllerUri() + '/instructions')
    }

    def instructions() {
        render(view: 'instructions')
    }

    def vizTask() {
        render(view: 'comparisonSurvey')
    }

    def vizTaskSave() {
        List<String> inputs = params.('people')
        Survey s = session.survey
        if (!(s.getQuestions()==null)) {
            if (!s.getQuestions().isEmpty()) {
                s.questions.clear()
            }
        }
        for (int i =1; i<inputs.size();i++) {
            Question question = vizSurveyService.createQuestion(inputs[i])
            s.addToQuestions(question)
        }
        s.save(flush:true)
        redirect(url: "/all" + this.getControllerUri() + '/recap')
    }

    def recap() {

        Survey s = session.survey

        Set<Question> questions = s.getQuestions()

        List<String> people = new  ArrayList<>()

        for (question in questions) {
            people.add(question.getText())
        }

//        def people = ["bill", "bob", "joe", "sue"]

        render(view: 'recap', model: [people: people])

    }

    def thankYou() {
        render(view: 'thankYou')
    }

    def index() {
        render('Hello, world!')
    }

}
