
<%@ page import="org.macademia.CollaboratorRequest" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="main" />
        <g:set var="entityName" value="${message(code: 'collaboratorRequest.label', default: 'CollaboratorRequest')}" />
        <title><g:message code="default.list.label" args="[user.fullName]" /></title>
    </head>
    <body id = main>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLink(uri: '/')}"><g:message code="Return to Macademia"/></a></span>
            <span class="menuButton"><g:link params="[group : params.group]" class="create" action="create"><g:message code="Request for collaborators" args="[entityName]" /></g:link></span>
        </div>
        <div class="body">
            <h1><g:message code="Viewing collaborator requests of ${user.fullName}" /></h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                        
                            <g:sortableColumn property="id" title="${message(code: 'collaboratorRequest.id.label', default: 'Id')}" />
                        
                            <g:sortableColumn property="title" title="${message(code: 'collaboratorRequest.title.label', default: 'Title')}" />
                        
                            <g:sortableColumn property="expiration" title="${message(code: 'collaboratorRequest.expiration.label', default: 'Expiration')}" />
                        
                            <g:sortableColumn property="description" title="${message(code: 'collaboratorRequest.description.label', default: 'Description')}" />
                        
                            <g:sortableColumn property="dateCreated" title="${message(code: 'collaboratorRequest.dateCreated.label', default: 'Date Created')}" />
                        
                            <th><g:message code="collaboratorRequest.creator.label" default="Creator" /></th>
                   	    
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${collaboratorRequestList}" status="i" var="collaboratorRequestInstance">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                        
                            <td><g:link params="[group : params.group]" action="show" id="${collaboratorRequestInstance.id}">${fieldValue(bean: collaboratorRequestInstance, field: "id")}</g:link></td>
                        
                            <td>${fieldValue(bean: collaboratorRequestInstance, field: "title")}</td>
                        
                            <td><g:formatDate date="${collaboratorRequestInstance.expiration}" /></td>
                        
                            <td>${fieldValue(bean: collaboratorRequestInstance, field: "description")}</td>
                        
                            <td><g:formatDate date="${collaboratorRequestInstance.dateCreated}" /></td>
                        
                            <td>${fieldValue(bean: collaboratorRequestInstance, field: "creator")}</td>
                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <div class="paginateButtons">
                <g:paginate total="${collaboratorRequestInstanceTotal}" />
            </div>
        </div>
    </body>
</html>
