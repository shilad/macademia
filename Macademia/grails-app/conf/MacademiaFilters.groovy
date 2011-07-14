import org.macademia.PersonService
import org.macademia.Person
import org.macademia.MacademiaConstants
import org.macademia.Utils

class MacademiaFilters {
    PersonService personService

   def filters = {
       loginCheck(controller:'*', action:'*') {
           before = {
               // see if we have an inbound url request
               if (params.authToken) {
                   Person person = personService.findByToken(params.authToken)
                   if (person == null) {
                       render('automatic authentication failed: authtoken unknown')
                   } else {
                       Utils.setAuthCookie(person, request, response)
                       params.remove('authToken')
                       String url = Utils.makeUrl(params.group, params.controller, params.action, params)
                       redirect(uri : url)
                   }
                   return false
               } else {
                   def cookie = request.cookies.find({it.name == MacademiaConstants.COOKIE_NAME})
                   if (cookie && cookie.value) {
                       Person person = personService.findByToken(cookie.value)
                       if (person) {
                           request.authenticated = person
                       }
                   }
                   return true
               }
           }
       }
   }
}