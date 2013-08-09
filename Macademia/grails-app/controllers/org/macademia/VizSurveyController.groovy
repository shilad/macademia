package org.macademia

import org.aspectj.weaver.patterns.TypePatternQuestions
import org.macademia.nbrviz.SurveyQuestion
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
            session.person = p.id
        }
        render(view:'consent')
    }

    def consentSave() {
        if (!session.person) {
            redirect(url: "/all" + this.getControllerUri() + '/consent')
            return
        }
        SurveyPerson p = SurveyPerson.findById(session.person)
        print(p)
        Survey s = new Survey(p)
        s.setConsent(true)
        s.save(flush: true)

        session.survey = s.id

        redirect(url: "/all" + this.getControllerUri() + '/interest')
    }


    def interest() {
        render(view: 'interest')
    }

    def interestSave() {
        List<String> inputs = params.('interest')
        SurveyPerson p = SurveyPerson.findById(session.person)
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
        Survey s = Survey.findById(session.survey)
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

        Survey s = Survey.findById(session.survey)

        Set<Question> questions = s.getQuestions()

        List<String> people = new  ArrayList<>()

        for (question in questions) {
            people.add(question.getText())
        }

//        def people = ["bill", "bob", "joe", "sue"]

        render(view: 'recap', model: [people: people])

    }

    def recapSave() {
        Survey s = Survey.findById(session.survey)
        for(string in params.keySet()) {
            List<String> stringList = string.split("_")
            if (stringList.contains("radio")) {
                Question q = Question.findAllBySurveyAndText(s, stringList[1])
                if (q == null) {
                    q = new Question(stringList[1])
                    s.addToQuestions(question)
                }
                q.setScore(Integer.parseInt(params.get(string)))
            }
        }
        s.save(flush: true)
    }



    def thankYou() {
        recapSave() //Cooler Way To Save
        render(view: 'thankYou')
    }

}
