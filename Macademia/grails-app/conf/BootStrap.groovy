import grails.util.Environment
import org.codehaus.groovy.grails.plugins.PluginManagerHolder
import org.wikapidia.conf.Configuration
import org.wikapidia.conf.Configurator
import org.wikapidia.core.dao.DaoFilter
import org.wikapidia.core.dao.LocalPageDao

class BootStrap {

    def autocompleteService
    def wikAPIdiaService

    def init = { servletContext ->
        switch(Environment.current) {
        case Environment.DEVELOPMENT:
            wikAPIdiaService.init()
            autocompleteService.init()
            break
        case Environment.PRODUCTION:
            wikAPIdiaService.init()
            autocompleteService.init()
            break
        }
     }

     def destroy = {
     }
}
