import grails.util.Environment
import org.codehaus.groovy.grails.plugins.PluginManagerHolder

class BootStrap {

    def autocompleteService

    def init = { servletContext ->
        
        def grass = PluginManagerHolder.pluginManager.getGrailsPlugin("grass")
        if (grass) {
            // This call ensures the css is compiled on runtime. Otherwise, changes to css
            // while the application is not running will not be compiled.
            grass.onChangeListener.call({ msg, args -> println("error in grass: $msg $args")})
        }

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
