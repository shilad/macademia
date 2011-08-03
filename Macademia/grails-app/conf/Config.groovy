import org.apache.commons.io.FileUtils
import org.apache.log4j.RollingFileAppender

// locations to search for config files that get merged into the main config
// config files can either be Java properties files or ConfigSlurper scripts

// grails.config.locations = [ "classpath:${appName}-config.properties",
//                             "classpath:${appName}-config.groovy",
//                             "file:${userHome}/.grails/${appName}-config.properties",
//                             "file:${userHome}/.grails/${appName}-config.groovy"]

// if(System.properties["${appName}.config.location"]) {
//    grails.config.locations << "file:" + System.properties["${appName}.config.location"]
// }


grails.config.locations = [ "file:${org.macademia.MacademiaConstants.LOCAL_CONFIG}" ]

grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.use.accept.header = false
grails.mime.types = [ html: ['text/html','application/xhtml+xml'],
                      xml: ['text/xml', 'application/xml'],
                      text: 'text/plain',
                      js: 'text/javascript',
                      rss: 'application/rss+xml',
                      atom: 'application/atom+xml',
                      css: 'text/css',
                      csv: 'text/csv',
                      all: '*/*',
                      json: ['application/json','text/json'],
                      form: 'application/x-www-form-urlencoded',
                      multipartForm: 'multipart/form-data'
                    ]
// The default codec used to encode data with ${}
grails.views.default.codec="none" // none, html, base64
grails.views.gsp.encoding="UTF-8"
grails.converters.encoding="UTF-8"

// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true

// set per-environment serverURL stem for creating absolute links
environments {
    production {
        grails.serverURL = "http://macademia.macalester.edu/${appName}"
    }
    development {
        grails.serverURL = "http://localhost:8080/${appName}"
    }
    test {
        grails.serverURL = "http://localhost:8080/${appName}"
    }

}

def LOG_FORMAT = '%d{ISO8601}\t%m\n'
def LOG_SIZE = 50*1024*1024  // 50MB (but should compress to zilch)

// log4j configuration
log4j = {

    // Machine-readable logs for experimental purposes
    appenders {
        appender new RollingFileAppender(
                            name:"access",
                            maxFileSize:LOG_SIZE,
                            fileName:"logs/access.log",
                            layout:pattern(conversionPattern: LOG_FORMAT))
        appender new RollingFileAppender(
                            name:"user",
                            maxFileSize:LOG_SIZE,
                            fileName:"logs/user.log",
                            layout:pattern(conversionPattern: LOG_FORMAT))
        appender new RollingFileAppender(
                            name:"tag",
                            maxFileSize:LOG_SIZE,
                            fileName:"logs/tag.log",
                            layout:pattern(conversionPattern: LOG_FORMAT))
    }

    debug   access : 'org.poliwiki.access', additivity : false
    debug   tag : 'org.poliwiki.tag', additivity : false
    debug   user : 'org.poliwiki.user', additivity : false

  // debug 'org.codehaus.groovy.grails.plugins.searchable'

    error  'org.codehaus.groovy.grails.web.servlet',  //  controllers
           'org.codehaus.groovy.grails.web.mapping', // URL mapping
           'org.codehaus.groovy.grails.web.pages', //  GSP
	       'org.codehaus.groovy.grails.web.sitemesh', //  layouts
	       'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
	       'org.codehaus.groovy.grails.commons', // core / classloading
	       'org.codehaus.groovy.grails.plugins', // plugins
	       'org.codehaus.groovy.grails.orm.hibernate', // hibernate integration
	       'org.springframework',
	       'org.hibernate'

    warn   'org.mortbay.log'

    info  'grails.app'

    // more detailed searchable debug logging
//    debug 'org.codehaus.groovy.grails.plugins.searchable'
//    trace 'org.compass'

}

// throw exceptions when saves fail.
grails.gorm.save.failOnError = true

def prepDirectories(prefix) {
    for (String file : ["db.script", "db.log", "db.properties"]) {
        def src = new File("db/${prefix}_backup/${file}")
        def dest = new File("db/${prefix}/${file}")
        FileUtils.deleteQuietly(dest)
        if (file == "db.log" && !src.exists()) {
            continue
        }
        FileUtils.copyFile(src, dest)
    }
}


macademia {
    salt = 'M@c@d8m1@'
    creatableFields = ['fullName', 'email', 'department', 'imageSubpath', 'links', 'title']
    editableFields = ['fullName', 'department', 'imageSubpath', 'links', 'title']
    collaboratorRequestFields = ['creator', 'title', 'description', 'expiration']
    maxSimilarInterests = 2000
    profileImagePath = "web-app/images/db"
}



grails {
    mail {
     from = "MacademiaAdmin"
     host = "smtp.gmail.com"
     port = 465
     username = "Macalester.Macademia@gmail.com"
     password = "admiN123!"
     props = ["mail.smtp.auth": "false",
       "mail.smtp.socketFactory.port": "465",
       "mail.smtp.socketFactory.class": "javax.net.ssl.SSLSocketFactory",
       "mail.smtp.socketFactory.fallback": "false"]
    }
}
grails.mail.default.from="macalester.macademia@gmail.com"

uiperformance.bundles = [
   [type: 'js',
    name: 'macademia.js.all',
    files: [
            'jquery/jquery-1.6.1.min',
            'jquery/jquery-ui-1.8.2.custom.min',
            'jquery/jquery-ui-1.8.5.custom.min',
            'jquery/jquery-deps',
            'jquery/jquery.qtip-1.0.0-rc3',
            'jquery/jquery.address-1.4',
            'jquery/jqModal',
            'ba-debug',
            'jit/jit',
            'lib.macademia',
            'lib.macademia.deps',
            'lib.macademia.json',
            'lib.macademia.jit',
            'lib.macademia.collegefilter',
            'lib.macademia.autocomplete',
            'lib.macademia.profile',
            'lib.macademia.slider',
            'nbrviz/raphael',
            'nbrviz/hoverset',
            'nbrviz/shared',
            'nbrviz/sphere',
            'nbrviz/interest',
            'nbrviz/person',
            'nbrviz/magnet',
            'nbrviz/vector',
            'nbrviz/graph',
            'nbrviz/exploration',
            'nbrviz/query'
    ]],
]


absoluteThreshold = 0.001
refinedThreshold = 0.08
roughThreshold = 0.15
// environment specific settings
environments {
    populateTest{
        absoluteThreshold = 0.15
        refinedThreshold = 0.08
        roughThreshold = 0.15

        // FIXME: Don't cap # similar interests while testing
        org.macademia.SimilarInterestList.MAX_SIMILAR_INTERESTS = 1000000
    }
    test {
        prepDirectories("test")
        wikipediaService.wikiCache = new File("db/test_backup/wikipedia.cache.txt")
        googleService.googleCache = new File("db/test_backup/google.cache.txt")
        absoluteThreshold = 0.01
        refinedThreshold = 0.08
        roughThreshold = 0.15

        uiperformance.enabled = false

        // FIXME: Don't cap # similar interests while testing
        org.macademia.SimilarInterestList.MAX_SIMILAR_INTERESTS = 1000000
    }
    populateDev {
    }
    development {
      uiperformance.enabled = false
    }
    populateProd {
    }
    production {
        //wikipediaService.setCache(new File("db/prodwiki_cache.txt"))
    }
    benchmark{
        //prepDirectories("benchmark")
        wikipediaService.wikiCache = new File("db/benchmark_backup/wikipedia.cache.txt")
        googleService.googleCache = new File("db/benchmark_backup/google.cache.txt")
    }
}

grails.views.javascript.library="jquery"
