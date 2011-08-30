import org.springframework.orm.hibernate3.SessionFactoryUtils
import org.springframework.orm.hibernate3.SessionHolder
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.apache.commons.io.FileUtils


/**
 * Deletes existing database.
 */
["db.log", "db.properties", "db.script"].each({
    File f = new File("db/test_backup/" + it)
    if (f.exists()) {
        f.delete()
    }
})

grailsEnv = 'populateTest'

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

    boolean necessary = false
    def databaseService = appCtx.getBean('databaseService')
    if (necessary) {
        def similarityService = appCtx.getBean('similarityService')
        similarityService.relationsBuilt = false
        databaseService.dropCurrentDB()
    }

    def populateService = appCtx.getBean('populateService')
    populateService.readInstitutions(new File("db/test/institutions.txt"))
    populateService.readPeople(new File("db/test/people.txt"))

    if (necessary) {
        //populateService.downloadInterestDocuments()
        populateService.buildInterestRelations()
    }

    session.connection().commit()
    def statement = session.connection().createStatement();
    statement.execute("SHUTDOWN;")
    session.close();

}

setDefaultTarget(main)
