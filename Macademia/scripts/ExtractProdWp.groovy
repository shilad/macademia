import org.springframework.orm.hibernate3.SessionFactoryUtils
import org.springframework.orm.hibernate3.SessionHolder
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.apache.commons.io.FileUtils



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

    def databaseService = appCtx.getBean('databaseService')
    databaseService.extractSmallWpDb('wikipediaReadOnlySmall')

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
