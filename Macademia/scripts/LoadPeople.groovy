import org.macademia.*


Person.withTransaction {

InterestService interestService = ctx.getBean("interestService")
PopulateService populateService = ctx.getBean("populateService")


interestService.initBuildDocuments(new File("db/prod/").toString())


System.in.eachLine() { line ->
    populateService.importPersonFromLine2(new File("stdin"), line)
}


}
