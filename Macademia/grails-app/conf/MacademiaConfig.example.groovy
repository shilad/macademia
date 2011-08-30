/**
 * This is an example of MacademiaConfig.groovy.
 * You can copy this file to create your own, or you can simply
 * create a new file with the lines that you need.
 *
 * MacademiaConfig.groovy allows you to override Config.groovy and DataSource.groovy.
 *
 * It's better to change this files than Config.groovy or DataSource.groovy.
 * If you change other files, you may get SVN conflicts when others change them.
 */

/**
 * This is the unique token that's appended onto all db names.
 * It defaults to the username on your system.
 * Uncomment this line to change the default value on your system.
 */
//macademia.uniqueDbToken = 'shilad'

/**
 * Uncomment this line to use a local mongo database server.
 */
//dataSource.mongoDbUrl = '127.0.0.1'

/**
 * Uncomment these to bring up a local snapshot of the production db.
 */
//dataSource.mongoDbUrl = '127.0.0.1'
//dataSource.url = "jdbc:postgresql://localhost:5432/macademia_prod"
//dataSource.mongoDbName = "macademia_prod"
//dataSource.driverClassName = "org.postgresql.Driver"
//dataSource.username = "grails"
//dataSource.password = "grails"
//dataSource.dialect = net.sf.hibernate.dialect.PostgreSQLDialect
//dataSource.mongoDbName = "macademia_prod"
