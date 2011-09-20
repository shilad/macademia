import org.macademia.*


Interest.withTransaction {
    InterestService interestService = ctx.getBean("interestService")
    interestService.updateArticlesToInterests()
}
