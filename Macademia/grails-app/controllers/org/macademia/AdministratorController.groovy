package org.macademia

/**
 * To access actions in the administrator controller you must
 * 1) Execute the resetKey action.
 * 2) Go to the logs and read out the new access key
 * 3) Execute a new action with the newly generated key
 *
 * It is crucial that all actions call checkAuth() first.
 */
class AdministratorController {
    private static int AUTH_KEY = newKey()
    def personService

    def resetKey = {
        AUTH_KEY = newKey()
        println("AUTH_KEY is " + AUTH_KEY)
        render("key reset... new key will appear in log file.  Grep for AUTH_KEY")
    }

    def ping = {
        render("pong")
    }

    private static int newKey() {
        return new Random().nextInt()
//        return 1
    }

    def invite = {
        checkAuth()
        ['template', 'email', 'baseUrl', 'subject'].each({
            if (!params[it]) {
                throw new IllegalArgumentException("missing ${it} parameter")
            }
        })
        String template = params.template
        String email = params.email
        String baseUrl = params.baseUrl
        String subj = params.subject
        Person p = personService.findByEmail(params.email)
        if (p) {
            String password = p.resetPasswd()
            String body = g.render(
                        template: "${template}",
                        model : [person : p, password : password, baseUrl : baseUrl]
                )
            sendMail {
                to "${email}"
                subject "${subj}"
                html "${body}"
            }
            render('okay')
        } else {
            render("unknown person: ${email}")
        }

    }

    private def checkAuth() {
        if ((params.key as int) != AUTH_KEY) {
            throw new IllegalArgumentException("invalid authorization key")
        }
    }
}
