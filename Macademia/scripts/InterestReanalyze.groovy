import org.macademia.*


Interest.withTransaction {

    WikAPIdiaService service = ctx.getBean("wikAPIdiaService")
    service.init()
//    service.buildInterests()
    service.buildSRCache()

}
