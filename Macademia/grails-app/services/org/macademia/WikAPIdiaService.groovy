package org.macademia

import org.wikapidia.conf.Configuration
import org.wikapidia.conf.Configurator
import org.wikapidia.core.dao.LocalPageDao

class WikAPIdiaService {
    Configurator configurator
    LocalPageDao localPageDao

    def init() {
        Configuration conf = new Configuration(new File("grails-app/conf/semtag.conf"))
        this.configurator = new Configurator(conf)
        localPageDao = configurator.get(LocalPageDao.class)
    }

    def serviceMethod() {
    }
}
