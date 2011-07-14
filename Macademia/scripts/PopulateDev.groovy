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

grailsEnv = 'populateDev'

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

    boolean necessary = true
    def databaseService = appCtx.getBean('databaseService')
    if (necessary) {
        def similarityService = appCtx.getBean('similarityService')
        similarityService.relationsBuilt = false
        databaseService.dropCurrentDB()
    }

    def populateService = appCtx.getBean('populateService')
    populateService.readInstitutions(new File("db/prod/institutions.txt"))
    populateService.readPeople(new File("db/prod/people.txt"))

    if (necessary) {
        //populateService.downloadInterestDocuments()
        populateService.buildInterestRelations()
    }

    session.connection().commit()
    def statement = session.connection().createStatement();
    try {
	statement.execute("SHUTDOWN;")
    } catch (Exception e) {
	    System.err.println("shutdown failed (this is okay on postgres)")
    }
    session.close();

}

setDefaultTarget(main)
