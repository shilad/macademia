<%@ page import="org.macademia.Wikipedia" %>
<div id="interestPage" class="medium padded2">
  <div id="interest_top_container">
    <div id="interest_info">
      <h2 id="interest_selected"><p:image id="tagPicture" src='int_tag.png'/>&nbsp;${interest.text}</h2>

      <div id="interest_people">
        <h3>People with this interest:</h3>
        <ul class="">
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
        <div id="wikipedia_links">
          <h3>Related wikipedia pages:</h3>
          <ul class="">
              <li>
                <a href="${Wikipedia.encodeWikiUrl(interest.articleName)}">${interest.articleName.encodeAsHTML()}</a>
              </li>
          </ul>
        </div>
      </g:if>

      <g:if test="${relatedInterests}">
        <div id="interest_related">
          <h3>Related interests:</h3>
          <ul>
            <g:each in="${relatedInterests}" var="interest">
              <g:if test="${interest != null}">
                <li>
                  <g:link url="#/?nodeId=i_${interest.id}&navFunction=interest&interestId=${interest.id}">
                    ${interest.text}
                  </g:link>
                </li>
              </g:if>
            </g:each>

          </ul>
        </div>
      </g:if>
    </div>
  </div>
</div>
