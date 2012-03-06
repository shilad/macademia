import org.macademia.*

DatabaseService databaseService = ctx.getBean("databaseService")
InterestService interestService = ctx.getBean("interestService")

for (Interest interest : Interest.findAll()) {
    // ensure that the interest has an entry in Mongo
    //if (interest.articleId == null || interest.articleId == -1) {
        //interestService.buildDocuments(interest)
        //databaseService.buildInterestRelations(interest.normalizedText, interest.id, interest.articleId, false)
    //}
    // set the interest's usage in Mongo
    databaseService.updateInterestUsage(interest.id)
}
