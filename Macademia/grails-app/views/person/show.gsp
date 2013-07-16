<%@ page import="org.macademia.Person" %>
<div id="person_info">
    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <g:if test="${person.imageSubpath}">
                <td id="pf_img" rowspan="2">
                    <img src="/Macademia/${params.group}/image/retrieve?subPath=${person.imageSubpath}">
                </td>
            </g:if>
            <td id="pf_name"><h1 id="currentFocus">${person.fullName.encodeAsHTML()}</h1></td>
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
    </table>
</div>

<div id="pf_email">
    <h4>
        <g:link url="mailto:${person.email}">${person.email}</g:link>
    </h4>
</div>

<div class="sidebarSection">
  <h2>Interests:</h2>
  <p>
    <g:set var="counter" value="${0}"/>
    <g:each in="${interests}" var="interest" >

      <g:set var="counter" value="${counter + 1}"/>
      <g:link url="#/?nodeId=i_${interest.id}&navFunction=interest&interestId=${interest.id}" params="[group : params.group]">${interest.text}<g:if test="${counter!=interests.size()}">,</g:if></g:link>
    </g:each>
  </p>
</div>
<g:if test="${collaboratorRequests}">
    <div class="sidebarSection">
        <h2>Collaborator Requests:</h2>
        <ul>
            <g:each in="${collaboratorRequests}" var="collaboratorRequest">

                <li><g:link
                        url="#/?nodeId=r_${collaboratorRequest.id}&navFunction=request&requestId=${collaboratorRequest.id}">${collaboratorRequest.title}</g:link></li>

            </g:each>
        </ul>
    </div>
</g:if>
<g:if test="${person.links}">
    <div class="sidebarSection">
        <h2>Links</h2>
        <ul>
            ${person.links}
        </ul>
    </div>
</g:if>

<g:if test="${request.authenticated && (request.authenticated.role > Person.USER_ROLE) && (!request.authenticated.equals(person)) && request.authenticated.canEdit(person)}">
    <div class="sidebarSection">
    <h2>Admin:</h2>
    <g:link url="[controller: 'account', action: 'edit', id: person.id, params: [group: params.group]]">Edit ${person.fullName.encodeAsHTML()}'s Profile</g:link>
</g:if>


</div>

