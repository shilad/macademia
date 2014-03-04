import org.macademia.*


Interest.withTransaction {

    WikAPIdiaService service = ctx.getBean("wikAPIdiaService")
    service.buildSr()

}
