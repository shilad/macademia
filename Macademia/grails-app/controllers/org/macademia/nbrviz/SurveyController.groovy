package org.macademia.nbrviz

import org.macademia.Person
import org.macademia.Utils
import org.macademia.Interest

class SurveyController {

    def interestService
    def subjectService
    def surveyService

    /**
     * Email link points here.
     */
    def intro = {
        Person person = request.authenticated
        Subject subject = null
        if (person) {
            subject = Subject.findByPerson(person)
        }
        if (person && !subject) {
            // found a person who has not started the survey already
            subject = new Subject(person:person)
            person.interests.each({
                subject.addToInterests(it)
            })
            subjectService.create(subject)
        }
        if (subject && subject.completedSurvey) {
            redirect(action: "outro", params: [subToken:subject.token])
        }
        return [subject: subject]
    }

    /**
     * Intermediate step from the intro action, applying the person's
     * consent decision.
     */
    def applyConsent = {
        def consent = Boolean.parseBoolean(params.consent)
        Subject subject = subjectService.findByToken(params.subToken)
        if (!subject && consent) {
            render(view: "createProfile")
        } else if (Boolean.parseBoolean(params.consent)) {
            subject.consent = consent
            Utils.safeSave(subject)
            redirect(action: "show", params: [subToken: subject.token])
        } else {
            // consent defaults to false, no need to set it again
            redirect(action: "optOut")
        }
    }

    /**
     * Intermediate step before showing the first page of the survey,
     * creating a temporary profile for use throughout the survey.
     */
    def createProfile = {
        if (params.interests.trim() == ""){
            redirect(action:"createProfile")
        }
        Subject subject = new Subject(consent: true)
        interestService.parseInterests(params.interests).each({
            subject.addToInterests(it as Interest)
        })
        subjectService.create(subject)
        redirect(action: "show", params: [subToken: subject.token])
    }

    /**
     * Shows the page of the survey which the subject is currently on.
     */
    def show = {
        Subject subject = subjectService.findByToken(params.subToken)
        if (!subject) {
            throw new IllegalArgumentException("Subject could not be found for token ${params.subToken}")
        }
        if (!subject.consent) {
            throw new IllegalArgumentException("Subject with id ${subject.id} does not consent to the survey")
        }

        // save responses to previous page
        if (subject.currentPage > 0) {
            def responses = [:]
            for (SurveyPage page : SurveyPage.findByPageNumber(subject.currentPage)) {
                for (Integer qNum : page.questions.questionNumber) {
                    responses[qNum] = params["q${qNum}"]
                }
            }
            subjectService.saveResponse(subject, responses)
        }

        // move onto the next page
        subject.currentPage++
        SurveyPage page = SurveyPage.findByPageNumber(subject.currentPage)
        if (page) {
            render(view: "show${page.pageNumber}", model: [subject: subject, page: surveyService.groupRadios(page)])
        } else {
            redirect(action: "outro", params: [subToken: subject.token])
        }
    }

    /**
     * Subject does not consent to participation, thank them anyway and
     * send them on their way.
     */
    def optOut = {
        render(view: "optOut")
    }

    /**
     * Subject has completed the survey, thank them and send them on their way.
     */
    def outro = {
        Subject subject = subjectService.findByToken(params.subToken)
        if (!subjectService.checkFinished(subject)) {
            throw new IllegalArgumentException("Subject with id ${subject.id} has not completed the survey")
        }
        subject.completedSurvey = true
        return [subject: subject]
    }
}
