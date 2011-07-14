<div class="medium padded2" id="coll_request">
  <div id="coll_top_container">
    <h2 id="coll_title">
      ${fieldValue(bean: collaboratorRequest, field: "title")}
    </h2>
    <p id="coll_kw"><span>Keywords:<br></span>
      <g:set var="counter" value="${0}"/>
      <g:each in="${collaboratorRequest.keywords}" var="k">
        <g:set var="counter" value="${counter + 1}"/>
        <g:link url="#/?nodeId=i_${k.id}&navFunction=interest&interestId=${k.id}">${k.text}<g:if test="${counter!=collaboratorRequest.keywords.size()}">,</g:if></g:link>
      </g:each>
    </p>
    <p id="coll_created"><span>Created:<br></span><g:formatDate format="MMMMMMMM d, yyyy" date="${collaboratorRequest?.dateCreated}"/> by <g:link url="#/?nodeId=p_${collaboratorRequest?.creator?.id}&navFunction=person&personId=${collaboratorRequest?.creator?.id}">${collaboratorRequest?.creator?.encodeAsHTML()}</g:link></p>
    <p id="coll_due"><span>Due:<br></span><g:formatDate format="MMMMMMMM d, yyyy" date="${collaboratorRequest?.expiration}"/></p>
    <p id="coll_desc"><span>Description:<br></span>${fieldValue(bean: collaboratorRequest, field: "description")}</p>
    <g:if test="${request.authenticated && request.authenticated.canEdit(collaboratorRequest.creator)}">
      <p id="coll_edit"><a href="#" id="editRequestButton">Edit request</a></p>
      <g:form action="delete">
        <g:if test="${collaboratorRequest.id}">
          <g:hiddenField name="requestId" value="${collaboratorRequest.id}"/>
          <g:actionSubmit value="delete" onclick="return confirm('Are you sure you want to delete this request?')">delete</g:actionSubmit>
        </g:if>
      </g:form>
    </g:if>
  </div>
  <g:javascript >
    $().ready(function() {
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

</div>