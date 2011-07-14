package org.macademia

class SearchController {
    def searchService
    def institutionService
    def institutionGroupService

    def index = { }

    def search = {
        def query = params.searchBox
        def offset
        def allMax = 10
        def pResults
        def iResults
        def rResults

        def institutionString = params.institutions
        def pageNumber = params.pageNumber.toInteger()

        // Prefix match!
        def cleanedQuery = query.toLowerCase()
        if (cleanedQuery[-1] != '*') {
            cleanedQuery += "*"
        }
        def pTotal = searchService.numPersonResults(cleanedQuery)
        def iTotal = searchService.numInterestResults(cleanedQuery)
        def rTotal = searchService.numRequestResults(cleanedQuery)

        Set<Long> institutions =  institutionGroupService.getInstitutionIdsFromParams(params)
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
        def pageNumber = params.pageNumber.toInteger()
        def type = params.type
        def personMax = 10
        def interestMax = 20
        def requestMax = 3
        def results = []
        def total

        // Prefix match!
        def cleanedQuery = query.toLowerCase()
        if (cleanedQuery[-1] != '*') {
            cleanedQuery += "*"
        }


        Set<Long> institutions =  institutionGroupService.getInstitutionIdsFromParams(params)
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
                max = interestMax
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

}