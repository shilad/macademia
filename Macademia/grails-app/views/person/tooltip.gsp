<div>
  <div class="ttName medium">${target.fullName}</div>
  <div class="ttDesc medium aside">
    <b>affiliation${target.memberships.size() > 1 ? 's' : ''}:</b> ${target.retrievePrimaryInstitution().name}<br/>
    <b>dept:</b> ${target.department}<br/>
    <b>email:</b> <a href="mailto:${target.email}">${target.email}</a><br/>
    <b>interests:</b>
    <%= target.interests.collect({it.text}).join(', ') %>
  </div>

  <g:if test="${exact || close}">
  <div class="ttRel medium">
    <b>related to ${linkName} by:</b>
    <g:if test="${exact}">
      <g:each in="${exact}" var="i">
        <li><i>${i}</i></li>
      </g:each>
    </g:if>
    <g:if test="${close}">
      <g:each in="${close.keySet()}" var="i">
        <li><i>${i.text}</i>
        (similar to ${close[i]})</li>
      </g:each>
    </g:if>
    </div>
  </g:if>
</div>