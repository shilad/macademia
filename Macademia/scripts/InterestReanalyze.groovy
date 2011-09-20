import org.macademia.*


Interest.withTransaction {

    SimilarityService similarityService = ctx.getBean("similarityService")
    similarityService.relationsBuilt = false

    def interests = Interest.findAll()
    println("building relations for ${interests.size()} interests\n")
    def i = 0
    interests.each() {
        i++
        println("($i of ${interests.size()}): building relation for ${it.text}")
        similarityService.buildInterestRelations(it)
    }
}
