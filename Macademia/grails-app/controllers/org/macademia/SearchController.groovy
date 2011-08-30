package org.macademia

import grails.converters.JSON

class SearchController {
    def searchService
    def institutionService
    def institutionGroupService

    def index = { }

    def search = {
        String query = params.searchBox
        def offset
        def allMax = 10
        def pResults
        def iResults
        def rResults

        def institutionString = params.institutions
        int pageNumber = params.pageNumber.toInteger()

        // Prefix match!
        def cleanedQuery = query.toLowerCase()
        if (cleanedQuery[-1] != '*') {
            cleanedQuery += "*"
        }
        def pTotal = searchService.numPersonResults(cleanedQuery)
        def iTotal = searchService.numInterestResults(cleanedQuery)
        def rTotal = searchService.numRequestResults(cleanedQuery)

        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        if (institutions == null) {
            pResults = searchService.searchPeople(cleanedQuery, pageNumber, allMax)
            iResults = searchService.searchInterests(cleanedQuery, pageNumber, allMax)
            rResults = searchService.searchCollaboratorRequests(cleanedQuery, pageNumber, allMax)
        } else {
            pResults = searchService.filterSearchPeople(cleanedQuery, pageNumber, allMax, pTotal, institutions)
            iResults = searchService.filterSearchInterests(cleanedQuery, pageNumber, allMax, iTotal, institutions)
            rResults = searchService.filterSearchCollaboratorRequests(cleanedQuery, pageNumber, allMax, rTotal, institutions)
        }
        render(template: "/search/searchResults", model: [people: pResults, totalPeople: pTotal, interests: iResults, totalInterests: iTotal, requests: rResults, totalRequests: rTotal, query: query, institutions: institutionString])


    }

    def deepsearch = {
        def query = params.searchBox
        def offset
        def pResults
        def iResults
        def rResults
        def institutionString = params.institutions
        int pageNumber = params.pageNumber.toInteger()
        def type = params.type
        def personMax = 10
        def interestMax = 15
        def requestMax = 3
        def results = []
        def total

        // Prefix match!
        String cleanedQuery = query.toLowerCase()
        if (cleanedQuery[-1] != '*') {
            cleanedQuery += "*"
        }


        InstitutionFilter institutions =  institutionGroupService.getInstitutionFilterFromParams(params)
        if (institutions == null) {
            if (type == "interest") {
                results = searchService.searchInterests(cleanedQuery, pageNumber * interestMax, interestMax)
                total = searchService.numInterestResults(cleanedQuery) / interestMax
            } else if (type == "person") {
                results = searchService.searchPeople(cleanedQuery, pageNumber * personMax, personMax)
                total = searchService.numPersonResults(cleanedQuery) / personMax
            } else {
                results = searchService.searchCollaboratorRequests(cleanedQuery, pageNumber * requestMax, requestMax)
                total = searchService.numRequestResults(cleanedQuery) / requestMax
            }

        } else {
            def preResults
            def max
            def i = 0
            if (type == "interest") {
                offset = pageNumber * interestMax
                max = interestMax
                def iTotal = searchService.numInterestResults(cleanedQuery)
                preResults = searchService.filterSearchInterests(cleanedQuery, 0, iTotal, iTotal, institutions)

            } else if (type == "person") {
                offset = pageNumber * personMax
                max = personMax
                def pTotal = searchService.numPersonResults(cleanedQuery)
                preResults = searchService.filterSearchPeople(cleanedQuery, 0, pTotal, pTotal, institutions)
            } else {
                offset = pageNumber * requestMax
                max = requestMax
                def rTotal = searchService.numRequestResults(cleanedQuery)
                preResults = searchService.filterSearchCollaboratorRequests(cleanedQuery, 0, rTotal, rTotal, institutions)
            }
            for (Object x: preResults) {
                if (i >= offset) {
                    results.add(x)
                }
                if (i >= (offset + max - 1)) {
                    break;
                }
                i++
            }
            total = preResults.size() / max
        }
        render(template: "/search/deepSearchResults", model: [results: results, query: query, type: type, index: pageNumber, total: total, institutions: institutionString])
    }

    def searchExistence = {
        String query = params.query
        query = query.toLowerCase()
        def person = searchService.searchPeople(query, 0, 1)
        def interest = searchService.searchInterests(query, 0, 1)
        def request = searchService.searchCollaboratorRequests(query, 0, 1)
        person = person.size() == 1 ? person[0] : null
        interest = interest.size() == 1 ? interest[0] : null
        request = request.size() == 1 ? request[0] : null
        def result = [:]
        if (person && person.fullName.toLowerCase() == query) {
            result.res = person
        } else if (interest && interest.text.toLowerCase() == query) {
            result.res = interest
        } else if (request && request.title.toLowerCase() == query) {
            result.res = request
        } else {
            result.res = null
        }
        render(result as JSON)
    }

}