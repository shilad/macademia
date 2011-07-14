import org.macademia.*


Person.withTransaction {

SimilarityService similarityService = ctx.getBean("similarityService")
similarityService.dedupeInterestRelations()

}
