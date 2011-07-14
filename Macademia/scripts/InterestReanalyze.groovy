import org.macademia.*


Interest.withTransaction {

    SimilarityService similarityService = ctx.getBean("similarityService")

    def interests = Interest.findAll()
    println("building relations for ${interests.size()} interests\n")
    def i = 0
    interests.each() {
        i++
        println("($i of ${interests.size()}): building relation for ${it.text}\n")
        similarityService.buildInterestRelations(it)
    }
}
