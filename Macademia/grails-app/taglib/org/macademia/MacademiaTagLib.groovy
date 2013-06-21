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

    def personImage = {
        attrs, body ->
        Person person = attrs.person
        if (person == null) {
            throw new IllegalStateException("missing person parameter to m:personImage")
        }
        String group = attrs.group ? attrs.group : params.group
        String uri = null
        if (person.imageSubpath) {
            uri = Utils.makeUrl(group, 'image', 'retrieve', ['subPath' : person.imageSubpath])
        } else if (person.email == 'ssen@macalester.edu') {
            uri = g.resource(dir : 'images', file : 'shilad.jpg')
        }
        if (uri == null) {
            throw new IllegalStateException("m:personImage no img for person ${person}")
        }

        out <<  '<img src=\"'
        out << createLink(['uri' : uri])
        out << '" alt=\"'
        out << person.fullName.encodeAsHTML()
        out << '"'
        if (attrs.id) {
            out << " id=\""
            out << attrs.id
            out << "\""
        }
        if (attrs['class']) {
            out << " class=\""
            out << attrs['class']
            out << "\""
        }
        out << '/>'
    }

}
