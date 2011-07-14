package org.macademia

class MacademiaTagLib {
    static namespace = 'm'

    def ifLoggedIn = {
        attrs, body ->
        if (request.authenticated) {
            out << body()
        }
    }

    def ifNotLoggedIn = {
        attrs, body ->
        if (!request.authenticated) {
            out << body()
        }
    }

    def ifAdmin = {
        attrs, body ->
        if (request.authenticated && request.authenticated.role == Person.ADMIN_ROLE) {
            out << body()
        }
    }

    def personLink = {
        attrs, body ->
        String group = attrs.group ? attrs.group : params.group
        attrs.uri = Utils.makeUrl(group, 'person', attrs.person.id, true)
        String bodyStr = body()
        if (bodyStr) {
            out << g.link(attrs, bodyStr)
        } else {
            out << g.link(attrs, attrs.person.fullName.encodeAsHTML())
        }
    }

    def requestLink = {
        attrs, body ->
        String group = attrs.group ? attrs.group : params.group
        attrs.uri = Utils.makeUrl(group, 'request', attrs.request.id)
        String bodyStr = body()
        if (bodyStr) {
            out << g.link(attrs, bodyStr)
        } else {
            out << g.link(attrs, attrs.request.title.encodeAsHTML())
        }
    }

    def interestLink = {
        attrs, body ->
        String group = attrs.group ? attrs.group : params.group
        attrs.uri = Utils.makeUrl(group, 'interest', attrs.interest.id)
        String bodyStr = body()
        if (bodyStr) {
            out << g.link(attrs, bodyStr)
        } else {
            out << g.link(attrs, attrs.interest.text.encodeAsHTML())
        }
    }

}
