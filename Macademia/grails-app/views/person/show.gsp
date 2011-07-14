<%--
  Created by IntelliJ IDEA.
  User: isparling
  Date: Aug 4, 2009
  Time: 2:46:41 PM
  To change this template use File | Settings | File Templates.
--%>

<div class="medium padded2" id="profile">
  <div id="pf_top_container">
    <table cellspacing="0" cellpadding="0">
    <tr>
      <g:if test="${person.imageSubpath}">
        <td id="pf_img" rowspan="2">
        <img src="/Macademia/${params.group}/image/retrieve?subPath=${person.imageSubpath}">
        </td>
      </g:if>
      <td id="pf_name">${person.fullName.encodeAsHTML()}</td>
    </tr>
    <tr>
      <td id="pf_inst">${person.institutionsToString().encodeAsHTML()}</td>
    </tr>
    <tr>
      <td colspan="2" id="pf_dept">
      <g:if test="${person.department && person.title}">
        ${person.title.encodeAsHTML()} of ${person.department.encodeAsHTML()}
      </g:if>
      <g:elseif test="${person.department}">
        ${person.department.encodeAsHTML()}
      </g:elseif>
      <g:elseif test="${person.title}">
        ${person.title.encodeAsHTML()}
      </g:elseif>
      </td>
    </tr>
    <tr>
      <td colspan="2">
      <h3 id="pf_email">
      <g:link url="mailto:${person.email}">${person.email}</g:link>
      </h3>
      </td>
    </tr>
    </table>
  </div>
  </div>
  <div id="pf_interests">
    <h4>Interests:</h4>
    <p class="atxt">
      <g:set var="counter" value="${0}"/>
      <g:each in="${interests}" var="interest" >

        <g:set var="counter" value="${counter + 1}"/>
        <g:link params="[group : params.group]" url="#/?nodeId=i_${interest.id}&navFunction=interest&interestId=${interest.id}">${interest.text}<g:if test="${counter!=interests.size()}">,</g:if></g:link>
      </g:each>
    </p>
  </div>
  <g:if test="${collaboratorRequests}">
  <div id="pf_requests">
    <h4>Collaborator Requests:</h4>
    <ul class="styledList atxt">
      <g:each in="${collaboratorRequests}" var="collaboratorRequest">
        
          <li><g:link url = "#/?nodeId=r_${collaboratorRequest.id}&navFunction=request&requestId=${collaboratorRequest.id}">${collaboratorRequest.title}</g:link></li>

      </g:each>
    </ul>
  </div>
  </g:if>
  <g:if test="${person.links}">
    <div id="pf_links">
        <h4>Links</h4>
        <ul class="styledList atxt">
          ${person.links}
        </ul>
    </div>
  </g:if>

<g:if test= "${request.authenticated && request.authenticated.canEdit(person)}">
  <div>
  <h4>Account:</h4>
      <ul class="styledList atxt">
      <li>
      <g:link url="[controller:'account',action:'edit', id:person.id, params: [group : params.group] ]">Edit Profile</g:link>
      <g:if test="${request.authenticated && request.authenticated.isShilad(person)}">
         <g:form controller="interest" action="reapOrphans">
              <g:actionSubmit value="Reap Orphans" action="reapOrphans" onclick="return confirm('are you sure you want to reap the orphans?')"/>
        </g:form>
      </g:if>
      </li>
      </ul>
</g:if>


  </div>
</div>

