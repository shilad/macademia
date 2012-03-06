import org.macademia.*


Interest.withTransaction {

    InterestService interestService = ctx.getBean("interestService")

    //def interests = Interest.findAll()
    def interests = Interest.findAllByNormalizedText('rap')
    println "building relations for ${interests.size()} interests\n"
    def i = 0
    interests.each() {
        i++
        println "($i of ${interests.size()}): building interest doc for ${it.text}"
        interestService.buildDocuments(it)
    }
}
