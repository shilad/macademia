<%--
  Created by IntelliJ IDEA.
  User: jeremy
  Date: Jul 2, 2010
  Time: 1:53:54 PM
  To change this template use File | Settings | File Templates.
--%>

<div>
  <div class="ttName medium">${target.title}</div>
  <div class="ttDesc medium aside">
    <b>creator:</b> ${target.creator.fullName}<br/>
    <b>email:</b> <a href="mailto:${target.creator.email}">${target.creator.email}</a><br/>
    <b>description:</b> ${target.description}<br/>
    <b>keywords:</b>
    <%= target.keywords.collect({it.text}).join(', ') %>
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
        <li><i>${close[i]}</i>
        (similar to ${i.text})</li>
      </g:each>
    </g:if>
    </div>
  </g:if>
</div>