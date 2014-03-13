grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.6
grails.project.source.level = 1.6
//grails.project.war.file = "target/${appName}-${appVersion}.war"

grails.project.fork = [
        run: [maxMemory: 4096, minMemory: 1024, debug: false, maxPerm: 256], // configure settings for the run-app JVM
]
grails.project.dependency.resolver = "maven"
grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // uncomment to disable ehcache
        // excludes 'ehcache'
    }
    log "warn" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve

    repositories {
        inherits true // Whether to inherit repository definitions from plugins
        grailsPlugins()
        grailsHome()

//        mavenRepo "http://snapshots.repository.codehaus.org"

        grailsCentral()
        mavenCentral()

        // uncomment these to enable remote dependency resolution from public Maven repositories
        //mavenCentral()
        mavenLocal()
        mavenRepo "https://oss.sonatype.org/content/repositories/snapshots"
        mavenRepo "http://repository.codehaus.org"

        mavenRepo "http://download.java.net/maven/2/"
        //mavenRepo "http://repository.jboss.com/maven2/"
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.
        runtime 'net.sf.trove4j:trove4j:3.0.3'
        compile 'org.codehaus.gpars:gpars:1.1.0'
        compile "net.sf.ehcache:ehcache-core:2.4.6"
        compile "net.sf.ehcache:ehcache-web:2.0.4"

        compile('com.github.shilad.wikapidia:wikAPIdia-sr:0.1-SNAPSHOT') {
            excludes "de.tudarmstadt.ukp.wikipedia", "de.tudarmstadt.ukp.wikipedia.parser"

        }
    }
    plugins {
//        runtime ":mail:1.0.1"
        runtime ":resources:1.2.1"
        runtime ":jquery:1.11.0.1"
//        compile ":compass-sass:0.7"
//        compile ":springcache:1.3.1"

        // Uncomment these (or add new ones) to enable additional resources capabilities
        //runtime ":zipped-resources:1.0"
        //runtime ":cached-resources:1.0"
        //runtime ":yui-minify-resources:0.1.4"
        runtime ':hibernate:3.6.10.8'
        if (System.getProperty("noTomcat") == null) {
            build ':tomcat:7.0.50.1'
        }
    }
}

