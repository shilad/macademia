import grails.util.Environment



class BootStrap {

    def populateService
    def interestRelationFilterService
    def similarityService
    def autocompleteService
    def grailsApplication

    def init = { servletContext ->

        switch(Environment.current) {
        case Environment.DEVELOPMENT:
            autocompleteService.init()
            break
        case Environment.PRODUCTION:
            autocompleteService.init()
            break
        }
     }

     def destroy = {
     }
}
