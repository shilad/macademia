package org.macademia

import grails.converters.JSON

class AutocompleteController {
    def autocompleteService

    def index = {
        def max = 10
        if (params.max) {
            max = params.max as int
        }
        List<AutocompleteEntity> results = null
        if (params.klass) {
            if (params.klass == 'interest') {
                results = autocompleteService.getInterestAutocomplete(params.group, params.term, max)
            } else if (params.klass == 'institution') {
                results = autocompleteService.getInstitutionAutocomplete(params.group, params.term, max)
            } else {
                throw new IllegalArgumentException("unknown klass to autocomplete: " + params.klass)
            }
        } else {
            def resultsByClass = autocompleteService.getOverallAutocomplete(params.group, params.term, max)
//            System.err.println("results for ${params.group}, ${params.term} are ${resultsByClass}")
           
            results = resultsByClass.get(Person.class, []) + resultsByClass.get(Interest.class, []) + resultsByClass.get(CollaboratorRequest.class, [])
        }

        def responseStr = ''
        def z = { s -> s.replaceAll('\n', '') }
        def jsonResults = results.collect {
            String simpleClassName = it.klass.getSimpleName().toLowerCase()
            ['' + it.id, z(it.name), '' + simpleClassName, '' + it.other ]
        }   // Displays Institution name beside results for 'Person' objects, rather than class name
        render(jsonResults as JSON)
    }
}
