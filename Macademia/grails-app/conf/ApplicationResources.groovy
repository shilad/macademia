modules = {
    core {
        dependsOn 'jquery'
        defaultBundle 'macademia.js.all'

        resource url: '/js/jquery/jquery-ui-1.8.2.custom.min.js'
        resource url: '/js/jquery/jquery-ui-1.8.5.custom.min.js'
        resource url: '/css/ui-lightness/jquery-ui-1.8.2.custom.css'
        resource url: '/css/style.css'
        resource url: '/js/jquery/jquery.qtip-1.0.0-rc3.js'
        resource url: '/js/jquery/jquery.address-1.6.js'
        resource url: '/js/jquery/jqModal.js'
        resource url: '/js/ba-debug.js'
        resource url: '/js/jit/jit.js'
        resource url: '/js/stacktrace.js'

        resource url: '/js/lib.macademia.js'
        resource url: '/js/lib.macademia.json.js'
        resource url: '/js/lib.macademia.jit.js'
        resource url: '/js/lib.macademia.collegefilter.js'
        resource url: '/js/lib.macademia.autocomplete.js'
        resource url: '/js/lib.macademia.profile.js'
        resource url: '/js/lib.macademia.density.js'
    }
    profile {
        dependsOn 'core'
        dependsOn 'upload'
    }
    consortia {
        dependsOn 'core'
        dependsOn 'upload'

        resource url: '/js/lib.macademia.consortia.js'
    }

    upload {
        dependsOn 'core'
        resource url: '/js/uploadify/swfobject.js'
        resource url: '/js/uploadify/jquery.uploadify.v2.1.0.js'
        resource url: '/js/uploadify/uploadify.css'
        resource url: '/js/lib.macademia.upload.js'

    }
    d3js {
        dependsOn 'core'
        resource url: '/js/d3test/d3.v3.js'
        resource url: '/js/d3test/utils.js'
        resource url: '/js/d3test/label.js'
        resource url: '/js/d3test/interest.js'
//        resource url: '/js/d3test/craZ-interest.js'
        resource url: '/js/d3test/person.js'
        resource url: 'js/d3test/person-layout.js'
        resource url: '/js/d3test/interest-layout.js'
        resource url: '/js/d3test/base-viz.js'
        resource url: '/js/d3test/person-center.js'
    }

    d3demo {
        dependsOn 'd3js'
        dependsOn 'nbrviz'
        resource url: '/js/d3test/d3play.js'
    }

    darth{

           dependsOn 'd3js'
        resource url: '/js/d3test/d3play.js'


    }


    nbrviz {
        dependsOn 'jquery'
        defaultBundle 'macademia.js.nbrviz'

        resource url: '/js/nbrviz/jquery-ui-1.8.16.custom.min.js'
        resource url: '/js/jquery/jquery.address-1.6.js'
        resource url: '/js/lib.macademia.js'
        resource url: '/js/lib.macademia.json.js'
        resource url: '/js/lib.macademia.jit.js'
        resource url: '/js/lib.macademia.collegefilter.js'
        resource url: '/js/lib.macademia.autocomplete.js'
        resource url: '/js/lib.macademia.profile.js'
        resource url: '/js/lib.macademia.density.js'
        resource url: '/js/nbrviz/inherit.js'
        resource url: '/js/nbrviz/raphael.js'
        resource url: '/js/nbrviz/raphael-component.js'
        resource url: '/js/nbrviz/hoverset.js'
        resource url: '/js/nbrviz/shared.js'
        resource url: '/js/nbrviz/colors.js'
        resource url: '/js/nbrviz/sphere.js'
        resource url: '/js/nbrviz/labeled-sphere.js'
        resource url: '/js/nbrviz/image-sphere.js'
        resource url: '/js/nbrviz/mnode.js'
        resource url: '/js/nbrviz/interest.js'
        resource url: '/js/nbrviz/person.js'
        resource url: '/js/nbrviz/magnet.js'
        resource url: '/js/nbrviz/vector.js'
        resource url: '/js/nbrviz/model.js'
        resource url: '/js/nbrviz/nbrviz.js'
        resource url: '/js/nbrviz/query.js'
        resource url: '/js/nbrviz/explore.js'
    }

    queryViz {
        dependsOn 'nbrviz'

        resource url: 'css/queryViz.css'
        resource url: 'css/nbrviz/jquery-ui-1.8.16.custom.css'
    }

}