import org.springframework.orm.hibernate3.SessionFactoryUtils
import org.springframework.orm.hibernate3.SessionHolder
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.apache.commons.io.FileUtils


/**
 * Deletes existing database.
 */
["devDb.log", "devDb.properties", "devDb.script"].each({
    File f = new File("db/dev/full/${it}")
    if (f.exists()) {
        f.delete()
    }
})


grailsEnv = 'production'

includeTargets << grailsScript("_GrailsBootstrap")

target ('main': "Load the Grails interactive shell") {
    depends(parseArguments, compile, configureProxy, packageApp, classpath)

    loadApp()
    configureApp()
    bootstrap()

    // prepare hibernate
    def sessionFactory = appCtx.getBean("sessionFactory")
    def session = SessionFactoryUtils.getSession(sessionFactory, true)
    TransactionSynchronizationManager.bindResource(sessionFactory, new SessionHolder(session))
    def tx = session.beginTransaction();

    def similarityService = appCtx.getBean('similarityService')
    def personService = appCtx.getBean('personService')
    def people = [
		'yuho01@luther.edu',
		'touslo01@luther.edu',
		'chamlee@beloit.edu',
		'yeh@ai.sri.com',
		'rabecr01@luther.edu',
		'wirth@macalester.edu',
		'greeje02@luther.edu',
		'kruse@macalester.edu',
		'hammarberg@macalester.edu',
		'jgrace@knox.edu',
		'heitner@lakeforest.edu',
		'peterb@pitt.edu',
		'ogonzale@macalester.edu',
		'brisbois@macalester.edu',
		'nchudgar@macalester.edu',
		'rossi@macalester.edu',
		'druggiero@monm.edu',
		'gunderson@macalester.edu',
		'houde@lakeforest.edu',
		'stanleyl@luther.edu',
		'ralstonc@grinnell.edu',
		'gomersni@luther.edu',
		'tmcnabb@coe.edu',
		'krueger@macalester.edu',
		'ssen@macalester.edu',
		'larsone@macalester.edu',
		'lhaslem@knox.edu',
		'dtimmerman@monm.edu',
		'jgodde@monm.edu',
		'jnollenb@macalester.edu',
		'khasting@knox.edu',
		'addona@macalester.edu',
		'thomda01@luther.edu',
		'gluck@cornellcollege.edu',
		'shandy@macalester.edu',
		'kainzm@ripon.edu',
		'rebelsky@grinnell.edu',
		'casson@stolaf.edu',
		'boychuk@macalester.edu',
		'goldman@macalester.edu',
		'adamon@macalester.edu',
		'kurthschai@macalester.edu',
		'fischer@macalester.edu',
		'dgross@carleton.edu',
		'dawes@macalester.edu',
		'orrc@beloit.edu',
		'rogers@macalester.edu',
		'dstrand@carleton.edu',
		'nygardt@ripon.edu',
		'wholling@carleton.edu',
		'scottcd@macalester.edu',
		'crutz@carleton.edu',
		'wells@macalester.edu',
		'david.gerard@lawrence.edu',
		'weimer17@gmail.com',
		'clarkj@ripon.edu',
		'jgould@coloradocollege.edu',
		'lmoore@monm.edu',
		'lknisel@knox.edu',
		'jones@lakeforest.edu',
		'szabin@carleton.edu',
		'godollei@macalester.edu',
		'bordena@stolaf.edu',
		'shautzinger@coloradocollege.edu',
		'wholling@carleton.edu',
		'stacy@monm.edu',
		'brownewi@luther.edu',
		'ding@macalester.edu',
		'brown@lakeforest.edu',
		'ajohns24@macalester.edu'
    ]

    people = [
        'harrisn@babson.edu'
    ]

    def t1 = System.currentTimeMillis()
    people.each({
        def person = personService.findByEmail(it)
        if (person == null) {
            System.err.println("couldn't find ${it}")
        } else {
            sessionFactory.currentSession.clear()
            def neighbors1 = similarityService.calculatePersonNeighbors(person, 100, null)
            def neighbors2 = similarityService.calculatePersonNeighbors(person, 100, null)
        }
    })
    def t2 = System.currentTimeMillis()
    println("elapsed time is ${t2 - t1}")
    println("mean time is ${(t2 - t1) / people.size()}")
}

setDefaultTarget(main)
