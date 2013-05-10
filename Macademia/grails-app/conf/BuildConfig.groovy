grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.6
grails.project.source.level = 1.6
//grails.project.war.file = "target/${appName}-${appVersion}.war"

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // uncomment to disable ehcache
        // excludes 'ehcache'
    }
    log "error" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
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
        //mavenRepo "http://snapshots.repository.codehaus.org"
        mavenRepo "http://repository.codehaus.org"
        //mavenRepo "http://download.java.net/maven/2/"
        //mavenRepo "http://repository.jboss.com/maven2/"
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.

        // runtime 'mysql:mysql-connector-java:5.1.16'
//        runtime "org.codehaus.groovy.modules.http-builder:http-builder:0.5.2"
        runtime 'net.sf.trove4j:trove4j:3.0.3'
        runtime 'org.apache.commons:commons-compress:1.4.1'
        runtime 'org.apache.commons:commons-lang3:3.1'
//        runtime 'edu.macalester:wpsemsim:0.2-SNAPSHOT'
    }
    plugins {
        runtime ":hibernate:$grailsVersion"
        runtime ":mail:1.0.1"
        runtime ":searchable:0.6.4"
        runtime ":springcache:1.3.1"
        runtime ":resources:1.2"
        runtime ":jquery:1.8.3"

        // Uncomment these (or add new ones) to enable additional resources capabilities
        //runtime ":zipped-resources:1.0"
        //runtime ":cached-resources:1.0"
        //runtime ":yui-minify-resources:0.1.4"

        build ":tomcat:$grailsVersion"
    }
}

