import grails.util.Environment
import org.codehaus.groovy.grails.plugins.PluginManagerHolder
import org.wikapidia.conf.Configuration
import org.wikapidia.conf.Configurator
import org.wikapidia.core.dao.DaoFilter
import org.wikapidia.core.dao.LocalPageDao

class BootStrap {

    def autocompleteService

    def init = { servletContext ->
        switch(Environment.current) {
        case Environment.DEVELOPMENT:
            loadTags()
            autocompleteService.init()
            break
        case Environment.PRODUCTION:
            autocompleteService.init()
            break
        }
     }

    def loadTags = {
        Configuration conf = new Configuration(new File("grails-app/conf/semtag.conf"))
        System.out.println(conf.get())
        Configurator configurator = new Configurator(conf)
        LocalPageDao lpDao = configurator.get(LocalPageDao.class)
        println("count is " + lpDao.getCount(new DaoFilter()))
    }

     def destroy = {
     }
}
