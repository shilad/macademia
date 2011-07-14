package org.macademia

import grails.converters.JSON;

class SimilarityController {

    def similarityService

    def index = { }

    def show = {

    }

    def list = {

    }
    def json = {
        if (!params.max) params.max = 10
        render Interest.list(params) as JSON
    }
}
