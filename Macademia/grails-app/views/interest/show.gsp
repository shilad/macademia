<%@ page import="org.macademia.Wikipedia" %>
<div id="interest_info">
  <h1 id="currentFocus"><r:img dir="images" id="tagPicture" file='int_tag.png'/>&nbsp;${interest.text}</h1>

  <div class="sidebarSection">
    <h2>People with this interest:</h2>
    <ul>
      <g:each in="${peopleWithInterest}" var="person">
        <li>
          <g:link url="#/?nodeId=p_${person.id}&navFunction=person&personId=${person.id}">
            ${person.fullName}
          </g:link>
        </li>
      </g:each>
    </ul>
  </div>

  <g:if test="${interest.articleName}">
    <div class="sidebarSection">
      <h2>Related wikipedia pages:</h2>
      <ul>
        <li>
          <a href="${Wikipedia.encodeWikiUrl(interest.articleName)}">${interest.articleName.encodeAsHTML()}</a>
        </li>
      </ul>
    </div>
  </g:if>

  <g:if test="${relatedInterests}">
    <div class="sidebarSection">
      <h2>Related interests:</h2>
      <ul>
        <g:set var="maxInterests" value="${11}"/>
        <g:each in="${relatedInterests.subList(0, Math.min(relatedInterests.size(), maxInterests))}" var="interest">
          <g:if test="${interest != null}">
            <li>
              <g:link url="#/?nodeId=i_${interest.id}&navFunction=interest&interestId=${interest.id}">
                ${interest.text}
              </g:link>
            </li>
          </g:if>
        </g:each>
        <g:if test="${relatedInterests.size() > maxInterests}">
          <li class="more"><a href="#">show ${relatedInterests.size() - maxInterests} more related interests&nbsp;...</a></li>
          <div class="more">
            <g:each in="${relatedInterests.subList(maxInterests, relatedInterests.size())}" var="interest">
              <g:if test="${interest != null}">
                <li>
                  <g:link url="#/?nodeId=i_${interest.id}&navFunction=interest&interestId=${interest.id}">
                    ${interest.text}
                  </g:link>
                </li>
              </g:if>
            </g:each>
          </div>
        </g:if>
      </ul>
    </div>
  </g:if>
</div>
