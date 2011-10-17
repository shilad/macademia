import org.macademia.*


Person.withTransaction {

    PersonService personService = ctx.getBean("personService")
    CollaboratorRequestService collaboratorRequestService = ctx.getBean("collaboratorRequestService")
    SimilarityService similarityService = ctx.getBean("similarityService")

    personService.cleanupPeople()
    collaboratorRequestService.cleanupCollaboratorRequests()
    similarityService.cleanupInterestRelations()
}
