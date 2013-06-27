<div id="createRequestContainer">
  <g:form params='[group : params.group]' controller='request' action='save'>
    <div id="rfcForm">
      <g:if test="${collaboratorRequest.id}">
          <h2 id="dialogTitle">Update Request</h2>
          <g:hiddenField name="requestId" value="${collaboratorRequest.id}"/>
      </g:if>
      <g:else>
          <h2 id="dialogTitle">Create Request</h2>
      </g:else>

      <div class="section">
          <div class="registerLeft"><label for="title">Title<span>Name for collaborator request</span></label></div>
          <div class="registerRight value ${hasErrors(bean: collaboratorRequest, field: 'title', 'errors')}">
            <g:textField name="title" value="${collaboratorRequest?.title}"/>
          </div>
      </div>

      <div class="section">
          <div class="registerLeft"><label for="expiration">Due Date<span>Date by which collaborators are needed</span></label></div>
          <div class="registerRight value ${hasErrors(bean: collaboratorRequest, field: 'expiration', 'errors')} datePicker">
            <g:datePicker name="expiration" precision="day" value="${collaboratorRequest?.expiration}"/>
          </div>
      </div>

      <div class="section">
          <div class="registerLeft"><label for="description">Description<span>Description of request</span></label></div>
          <div class="registerRight value ${hasErrors(bean: collaboratorRequest, field: 'description', 'errors')}">
            <g:textArea id="requestDescriptionBox" name="description" rows="10" cols="80" value="${collaboratorRequest?.description}"/>
          </div>
      </div>

      <div class="section">
          <div class="registerLeft"><label for="keywords">Keywords<span>keywords related to the request</span></label></div>
          <div class="registerRight value ${hasErrors(bean: collaboratorRequest, field: 'keywords', 'errors')}">
            <g:textArea rows="5" cols="80" id="requestKeywordsBox" name="keywords" value="${keywords?.encodeAsHTML()}"/>
          </div>
      </div>

    </div>
    <div id="submitRequest">
      <g:submitButton name="create" class="save" value="${collaboratorRequest.id ? 'Update' : 'Create'}"/>
    </div>
  </g:form>
  <r:script >
    $(document).ready(function () {
        macademia.autocomplete.initEditRequest();
        $("#listRequestDialog").jqmHide();
    });
</r:script>
</div>
