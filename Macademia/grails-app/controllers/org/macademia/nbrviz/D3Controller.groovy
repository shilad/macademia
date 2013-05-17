package org.macademia.nbrviz

class D3Controller {

    def index = {

        println("rendering ${params.module}")
        render(view : "${params.module}")
    }
}
