package org.macademia

import javax.servlet.http.Cookie
import org.codehaus.groovy.grails.commons.ConfigurationHolder
import grails.util.Environment
import grails.converters.JSON

class AccountController {
    def autocompleteService
    def personService
    def interestService
    def userLoggingService
    def institutionService
    def institutionGroupService
    def jsonService


    def forgottenpassword = {
        render(view : 'forgottenpassword', model : [])
    }

    def forgottenpasswordcomplete = {
        String email = params.email
        Person person = personService.findByEmail(email)
        if (!person) {
            render(view : 'forgottenpassword', model : [error : "No account is associated with email address ${email}"])
            return
        }
        String newPassword = person.resetPasswd()
        personService.save(person)

        sendMail {
            to email
            subject "Your Macademia password has been reset"                        
            body """Dear ${params.email},

We have reset your Macademia password to \"${newPassword}\".

You can login to Macademia with this new password at ${ConfigurationHolder.config.grails.serverURL as String}.  Please change your password as soon as possible.

Thank you! 

The Macademia Team

(Do not reply to this e-mail.)
"""
        }

        render(view : 'message',
               model : [
                   title : "Password recovered.",
                   message : "We have emailed a new password to you at ${email}."
               ])
    }


    def changepassword = {
        if (!request.authenticated) {
            render("not logged in.")
            return
        }
        if (params.currentPassword && !request.authenticated.checkPasswd(params.currentPassword)) {
            def id = request.authenticated.id
            redirect(uri: Utils.makeUrl(params.group, 'person', request.authenticated.id, true))
        } else {
            // hack if the current password param is not current, assume the user
            // has already clicked an email link to change their password, and now
            // wants to visit macademia proper.
            render(view : 'changepassword', model : [currentPassword : params.currentPassword])
        }
    }
    
    def changepasswordcomplete = {        
        if (!request.authenticated) {
            render("not logged in.")
            return
        }
        String error = ''
        if (!params.currentPassword) {
            error = 'Please enter your current password.'
        } else if (!params.password) {
            error = 'Please enter a new password.'
        } else if (!params.password) {
            error = 'Please confirm your new password.'
        } else if (!request.authenticated.checkPasswd(params.currentPassword)) {
            error = 'Your current password is incorrect.'
        } else if (params.password.length() < 6) {
            error = 'Your password must be at least 6 characters.'
        } else if (params.password != params.passwordConfirm) {
            error = 'Your new passwords do not match.'
        }
        if (error) {
            def model = [error : error]
            if (params.fromEmail && params.currentPassword) {
                model.currentPassword = params.currentPassword
            }
            render(view : 'changepassword', model : model)
            return
        }
        request.authenticated.updatePasswd(params.password)
        personService.save(request.authenticated)

        if (params.fromEmail) {
            redirect(uri : Utils.makeUrl(params.group, params.controller, 'edit', [:]))
        } else {
            render(view : 'message',
                   model : [
                       title : "Password changed.",
                       message : "Your password has been successfully changed."
                   ])
        }
    }
    
    def signin = {
        Person person = personService.findByEmail(params.email.toLowerCase())
        if (person == null) {
            render('unknown email address')
            return
        } else if (!person.checkPasswd(params.password)) {
            render('invalid passwd')
            return
        } else if (!person.enabled) {
            render('your account has been disabled')
            return
        }
        Utils.setAuthCookie(person, request, response)
        render('okay ' + person.id)
    }

    private void setAuthCookie(Person person) {
        def cookie = new Cookie(MacademiaConstants.COOKIE_NAME, person.token)
        cookie.path = "/"
        cookie.setMaxAge(MacademiaConstants.MAX_COOKIE_AGE)
        response.addCookie(cookie)
        request.authenticated = person
    }

    def logout = {
        String target = Utils.makeUrl(params.group, 'person', (request.authenticated.id as long))
        session.invalidate()
        def cookie = new Cookie(MacademiaConstants.COOKIE_NAME, "")
        cookie.path = "/"
        response.addCookie(cookie)
        redirect(url: request.contextPath + target)
    }

    /**
     * Creates a brand new user.
     */
    def saveuser = {
        Person person = new Person()
        person.properties[grailsApplication.config.macademia.creatableFields] = params
        person.email = params.email.toLowerCase()
        println "person's email is ${person.email}"
        // Handle interest splitting
        if (params.interests){
            interestService.parseInterests(params.interests).each({
                person.addToInterests(it)
            })
        } else {
            person.invisible = true
        }
        person.enabled = true

        log.debug("Attempting to create new user account identified as $person.email")

        // Enforce email address for account registrations
        if (person.email == null || person.email.length() == 0)  {
          person.email = 'invalid'
          render('No email provided')
          return
        }
        if (params.pass != params.passConfirm) {
          render("Passwords do not match")
          return
        }
        if (personService.findByEmail(person.email) != null) {
          render("Email already in use")
          return
        }
        if (!params.institution == null || params.institution.length() == 0) {
          render("No primary institution provided")
          return
        }
        def webUrl = institutionService.normalizeWebUrl(params.institutionURL)
        if (!webUrl){
            render("institution url is invalid")
            return
        }
        // TODO: special url that automatically sets one of the "other institutions to the biologists
        List institutionList = institutionParse(
                                    params.institution,
                                    webUrl,
                                    extractEmailDomain(params.email.toLowerCase()),
                                    params.otherInstitutions
                                )

        try {
            personService.create(person, params.pass, institutionList)
        } catch(Exception e) {
            log.error("creation of " + person + " failed")
            log.error(e)
            render("Internal error: " + e.getMessage())
            return
        }

        person.save(flush : true)    // flush to get the id
        log.info("Created new account identified as $person.email with internal id $person.id")
        // Notify admin about new user
        if (Environment.current == Environment.PRODUCTION) {
            sendMail {
                to "macalester.macademia@gmail.com"
                subject "New User Created - Macademia"
                body """
                Name:           ${person.fullName}
                Email:          ${person.email}
                Institution:    ${person.institutionsToString()}
                """
            }
        }
        // Set the login cookie.
        Utils.setAuthCookie(person, request, response)

        userLoggingService.logEvent(request, 'profile', 'create', person.toMap())

        render('okay ' + person.id)
    }

    def institutionParse(String primaryInstitution, String primaryUrl, String primaryEDomain, String otherInstitutionsString) {
        // list is inst name, url, email domain
        def institutionStringsList = []
        institutionStringsList[0] = [primaryInstitution, primaryUrl, primaryEDomain]
        for (otherInstitution in otherInstitutionsString.trim().split("&")){
            otherInstitution = otherInstitution.trim()
            if (otherInstitution && otherInstitution != '#') {
                def (name, url) = otherInstitution.trim().split("#") // name, url
                url = institutionService.normalizeWebUrl(url)
                if (url) {
                    institutionStringsList.add([name, url, null])
                }
            }
        }

        // institutionList must be a list, not a set, since it needs to preserve ordering
        def institutionList = []

        // TODO: emaildomain are not set for otherinstitutions. Allow abbrev, edomain and url to be editable by institutionAdmins.
        for (triple in institutionStringsList){
            def (name, url, emailDomain) = triple
            def institution = (url) ? Institution.findByWebUrl(url) : Institution.findByName(name)
            if (!institution) {
                institution= new Institution(name:name, emailDomain:emailDomain, webUrl: url )
                def allGroup = institutionGroupService.getAllGroup()
                institutionGroupService.addToInstitutions(allGroup, institution)
                Utils.safeSave(allGroup)
                autocompleteService.addInstitution(institution)
            }

            if (!institutionList.contains(institution)) institutionList.add(institution);
        }

        return institutionList
    }

    def extractEmailDomain(emailString){
        String[] afterAt = (emailString).split('@')[1].split('\\.')
        return "${afterAt[afterAt.length-2]}.${afterAt[afterAt.length-1]}"
    }

    def createuser = {
        return render(
              view: 'createUser',
                model: [
                      user : new Person(),
                      interests : params.interests ? params.interests : "",
                      allInstitutions : jsonService.makeJsonForInstitutions() as JSON,
                      otherInstitutions : [:] as JSON
              ]
        )
    }

    def login = {
      return render(view: 'login')
    }


    private def resetNewUser = {user ->
        log.debug("New user creation failed, resetting user input to accepted state")

        if (user.profile?.email.equals('invalid'))
        	user.profile.email = ''

        user.pass = ""
        user.passConfirm = ""
    }

    def edit = {
        Person person = null
        if (!request.authenticated) {
            throw new IllegalStateException("no user present!")
        } else if (!params.id){
            person = request.authenticated
        } else {
            person = Person.get(params.id)
            //admin check
            if (!request.authenticated.canEdit(person)) {
                throw new IllegalArgumentException("not authorized")
            }
        }
        if (!person) {
            log.warn("User identified by id '$params.id' was not located")
            flash.type = "error"
            flash.message = message(code: 'nimble.user.nonexistant', args: [params.id])
            redirect(uri: '/')
        }
	    else {
            log.info("Editing user [$person.id] $person.email")
            person.properties[grailsApplication.config.macademia.editableFields] = params
            String allInterests = person.interests.collect({it.text}).join(', ')
            return render(
                    view: 'createUser',
                    model: [
                            user: person,
                            interests : allInterests,
                            primaryInstitution: person.retrievePrimaryInstitution(),
                            otherInstitutions: jsonService.makeJsonForNonPrimaryInstitutions(person) as JSON,
                            allInstitutions : jsonService.makeJsonForInstitutions() as JSON
                    ])
	    }
    }

    def delete = {
        def person
        def current = request.authenticated
        if (params.personId){
            person = Person.get(params.personId)
            if (!request.authenticated.canEdit(person)) {
                throw new IllegalArgumentException("not authorized")
            }
        } else{
            person = current
        }
        if (!person) {
            render("User identified by id '$params.id' was not located")
        } else {
            personService.delete(person)
            //userLoggingService.logEvent(something)
            log.info("Successfully deleted user [$person.id] $person.email")
            if (current == person){
               session.invalidate()
               def cookie = new Cookie(MacademiaConstants.COOKIE_NAME, "")
               cookie.path = "/"
               response.addCookie(cookie)
            }
            redirect(uri: "/")
        }
    }

    def updateuser = {
        Person person
        if (params.id) {
            person = Person.get(params.id)
            if (!request.authenticated.canEdit(person)) {
                throw new IllegalArgumentException("not authorized")
            }
        } else {
            person = request.authenticated
        }
        if (!person) {
            render("User identified by id '$params.id' was not located")
        } else {
            person.properties[grailsApplication.config.macademia.editableFields] = params
            //password check
            if (!person.validate()) {
                render("Updated details for user [$person.id] $person.email are invalid")
            } else {
                def oldInterests = person.interests
                if (params.interests){
                    interestService.parseInterests(params.interests).each({
                        person.addToInterests(it)
                    })
                    person.invisible = false
                } else {
                    person.invisible = true
                }
                interestService.deleteOld(oldInterests, person)
                def webUrl = institutionService.normalizeWebUrl(params.institutionURL)
                if (!webUrl){
                    render("institution url is invalid")
                    return
                }
                def otherInstitutions = params.otherInstitutions
                println("otherInstiuttions is ${otherInstitutions}")
                List institutionList = institutionParse(params.institution, webUrl, extractEmailDomain(person.email), otherInstitutions)
	            personService.save(person, institutionList)
                userLoggingService.logEvent(request, 'profile', 'update', person.toMap())
                log.info("Successfully updated details for user [$person.id] $person.email")

                render('okay ' + person.id)
            }
        }

    }

}
