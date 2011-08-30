<%@ page import="org.macademia.Person" %>
<div id="request_info">
  <h1 id="currentFocus">${fieldValue(bean: collaboratorRequest, field: "title")}</h1>
  <div class="sidebarSection">
    <h2>Keywords:</h2>
    <g:set var="counter" value="${0}"/>
    <g:each in="${collaboratorRequest.keywords}" var="k">
      <g:set var="counter" value="${counter + 1}"/>
      <g:link url="#/?nodeId=i_${k.id}&navFunction=interest&interestId=${k.id}">${k.text}<g:if test="${counter!=collaboratorRequest.keywords.size()}">,</g:if></g:link>
    </g:each>
  </div>
  <div class="sidebarSection">
    <h2>Created:</h2><g:formatDate format="MMMMMMMM d, yyyy" date="${collaboratorRequest?.dateCreated}"/> by <g:link url="#/?nodeId=p_${collaboratorRequest?.creator?.id}&navFunction=person&personId=${collaboratorRequest?.creator?.id}">${collaboratorRequest?.creator?.encodeAsHTML()}</g:link>
  </div>
  <div class="sidebarSection">
    <h2>Due:</h2><g:formatDate format="MMMMMMMM d, yyyy" date="${collaboratorRequest?.expiration}"/>
  </div>
  <div class="sidebarSection">
    <h2>Description:</h2>${fieldValue(bean: collaboratorRequest, field: "description")}
  </div>
  <div class="sidebarSection">
    <g:if test="${request.authenticated && request.authenticated.canEdit(collaboratorRequest.creator)}">
      <g:if test="${(request.authenticated.role > Person.USER_ROLE) && (!request.authenticated.equals(collaboratorRequest.creator))}">
        <h2>Admin:</h2>
      </g:if>
      <g:else>
        <h2>Manage request:</h2>
      </g:else>
      <p><a href="#" id="editRequestButton">Edit request</a></p>
      <div class="customButton" id="request_delete">
        <g:link base="/Macademia/${params.group}" controller='request' action='delete' params= "[requestId: collaboratorRequest.id]" onclick="return confirm('Are you sure you want to delete this request?')">Delete Request</g:link>
      </div>
    </g:if>
  </div>
</div>
  <g:javascript >
    $(document).ready(function() {
        $("#editRequestDialog").jqm({
            ajax: "/Macademia/${params.group}/request/edit/${collaboratorRequest.id}",
            modal: false});
        $("#editRequestButton").click(
            function () {
                try {
                    $("#editRequestDialog").jqmShow();
                } catch(err) {
                    alert('error when triggering edit request:' + err);
                }
            });
      });
  </g:javascript>
