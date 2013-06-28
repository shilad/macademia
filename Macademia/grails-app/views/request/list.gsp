<div id="listRequestContainer">
  <h1>Collaboration Requests:</h1>
  <p>
    <g:if test= "${request.authenticated}">

    Click a request to view more information or
      <a class="makeRequestLink" href="#">create a new request.</a>
    </g:if>
    <g:else>
      Click a request to view more information.
      Please login to create a new request.
    </g:else>
  </p>
  <table>

    <g:if test="${collaboratorRequestList}">
        <thead>
        <tr>
          <th class="title">Title</th>
          <th class="expires">Expires</th>
          <th class="creator">Creator</th>
          <th class="description">Description</th>
        </tr>
        </thead>
    </g:if>
    <tbody>
    <g:each in="${collaboratorRequestList}" status="i" var="c">
      <tr class="${(i % 2) == 0 ? 'odd' : 'even'}" requestId="${c.id}">
        <td class="title">
          ${c.title.encodeAsHTML()}&nbsp;&nbsp;
        </td>
        <td class="expires"><g:formatDate date="${c.expiration}" format="yyyy-MM-dd"/>&nbsp;&nbsp;</td>
        <td class="creator">${c.creator.fullName.encodeAsHTML()}&nbsp;&nbsp;</td>
        <td class="description">
          <g:if test="${c.description && c.description.length() > 80}">${c.description.substring(0, 80).encodeAsHTML()}...</g:if>
          <g:else>${c.description.encodeAsHTML()}</g:else>
        </td>
      </tr>
    </g:each>
    <g:if test="${collaboratorRequestList.size() == 0}">
        <tr>
          <td class="title">No existing requests.</td>
        </tr>
    </g:if>
    </tbody>
  </table>
  <div id="closeListRequests">
    <a href ="#"><r:img dir="images" file="close_icon.gif"/></a>
  </div>
  <script>
  $().ready(function () {
    $("#makeRequestDialog").jqmAddTrigger($('.makeRequestLink'));
    $("#closeListRequests a").click(function(){
        $('#listRequestDialog').jqmHide();
        return false;
    });
    $("#listRequestContainer tr").click(function() {
        macademia.reloadToRequest($(this).attr('requestId'));
      return false;
    });
  });
  </script>
</div>
