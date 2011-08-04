dataSource {
	pooled = true
	driverClassName = "org.hsqldb.jdbcDriver"
	username = "sa"
	password = ""
    mongoDbUrl = "poliwiki.macalester.edu"
    wpMongoDbName = "wikipediaReadOnly"
}

hibernate {
    cache.use_second_level_cache=true
    cache.use_query_cache=true
    cache.provider_class='net.sf.ehcache.hibernate.EhCacheProvider'
}

uniqueDbToken = System.getProperty('user.name')

// Grab a few crucial things from the local config if they are available
File f = new File(org.macademia.MacademiaConstants.LOCAL_CONFIG)
if (f.exists()) {
    def config2 = new ConfigSlurper().parse(f.toURL())
    if (config2.macademia?.uniqueDbToken) {
        uniqueDbToken = config2.macademia.uniqueDbToken
    }
}
System.err.println("unique dbtoken is ${uniqueDbToken}")

// environment specific settings
environments {
    /**
     * Test database environments (one per person)
     */
	populateTest {
		dataSource {
			dbCreate = "create" // one of 'create', 'create-drop','update'
			url = "jdbc:hsqldb:file:db/test_backup/db;shutdown=true"
            mongoDbName = "macademia_test_${uniqueDbToken}"
            wpMongoDbName = "wikipediaReadOnlyTest"
        }
	}
	test {
		dataSource {
			dbCreate = "update"
			url = "jdbc:hsqldb:file:db/test/db;shutdown=true"
            mongoDbName = "macademia_test_${uniqueDbToken}"
            wpMongoDbName = "wikipediaReadOnlyTest"
        }
	}
    /**
     * Development database environments (one per person)
     */
	populateDev {
		dataSource {
			dbCreate = "create" // one of 'create', 'create-drop','update'
            mongoDbName = "macademia_dev_${uniqueDbToken}"
			url = "jdbc:hsqldb:file:db/dev/full/devDb;shutdown=true"
		}
	}
	development {
		dataSource {
			dbCreate = "update" // one of 'create', 'create-drop','update'
			url = "jdbc:hsqldb:file:db/dev/full/devDb;shutdown=true"  //dev
            mongoDbName = "macademia_dev_${uniqueDbToken}"
		}
	}
    /**
     * Production database environments (shared)
     */
	production {
		dataSource {
			dbCreate = "update"
            pooled = false
            url = "jdbc:postgresql://localhost:5432/macademia_prod"
            driverClassName = "org.postgresql.Driver"
            username = "grails"
            password = "grails"
            dialect = net.sf.hibernate.dialect.PostgreSQLDialect
            mongoDbName = "macademia_prod"
		}
	}
    /**
     * Benchmark database environments
     */
    benchmark {
		dataSource {
			dbCreate = "update" // one of 'create', 'create-drop','update'              
            mongoDbName = "benchmark"

            pooled = false
            url = "jdbc:postgresql://poliwiki.macalester.edu:5432/macademia_bench"
            driverClassName = "org.postgresql.Driver"
            username = "grails"
            password = "grails"
            dialect = net.sf.hibernate.dialect.PostgreSQLDialect
		}
	}
    populateBenchmark{
		dataSource {
			dbCreate = "update" // one of 'create', 'create-drop','update'
            mongoDbName = "benchmark"
            
            pooled = false

            url = "jdbc:postgresql://poliwiki.macalester.edu:5432/macademia_bench"
            driverClassName = "org.postgresql.Driver"
            username = "grails"
            password = "grails"
            dialect = net.sf.hibernate.dialect.PostgreSQLDialect

		}
	}
}
