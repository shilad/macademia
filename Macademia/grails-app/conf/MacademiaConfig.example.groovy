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
 */
macademia.uniqueDbToken = 'asdfasdfaasf'

/**
 * If you wanted to change a single value, you would do something like this.
 */
dataSource.mongoDbUrl = '127.0.0.1'