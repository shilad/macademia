<g:setProvider library="jquery"/>
<div id="searchWrapper">
  </div>
  <div class="searchHeader atxt">
    <g:if test="${people || interests || requests}">
      Results matching <b>${query.encodeAsHTML()}</b>:
    </g:if>
    <g:elseif test="${institutions != 'all institutions'}">
      No <b>filtered</b> search results found for <b>${query.encodeAsHTML()}</b>.
    </g:elseif>
    <g:else>
      No search results found for <b>${query.encodeAsHTML()}.</b>
    </g:else>
  </div>

  <g:if test="${people || interests || requests}">
    <g:if test="${people}">
      <div class="searchHeader atxt">Matching <b>people:</b></div>

      <ul class="styledList">
        <g:each in="${people}" var="p">
          <li>
            <g:link url = "#/?nodeId=p_${p.id}&navFunction=person&personId=${p.id}&searchBox=">${p.fullName}</g:link>
          </li>
        </g:each>
      <g:if test="${totalPeople >10}">
          <a href="#/?searchPage=person_0" class="moreSearchResults"> (see all ${totalPeople} results...)</a>
        </g:if>
      </ul>
    </g:if>
    <g:elseif test="${totalPeople > 0}">
      <div class="searchHeader atxt">No <b>filtered</b> matches for <b>people</b>.</div>
    </g:elseif>
    <g:else>
      <div class="searchHeader atxt">No matches for <b>people</b>.</div>
    </g:else>

    <g:if test="${interests}">
      <div class="searchHeader atxt">Matching <b>interests:</b></div>

      <ul class="styledList">
        <g:each in="${interests}" var="i">
          <li>
            <g:link url = "#/?nodeId=i_${i.id}&navFunction=interest&interestId=${i.id}&searchBox=">${i.text}</g:link>
          </li>
        </g:each>
      <g:if test="${totalInterests > 10}">
        <a href="#/?searchPage=interest_0" class="moreSearchResults"> (see all ${totalInterests} results...)</a>
      </g:if>
      </ul>
    </g:if>
    <g:elseif test="${totalInterest > 0}">
      <div class="searchHeader atxt">No <b>filtered</b> matches for <b>interests</b>.</div>
    </g:elseif>
    <g:else>
      <div class="searchHeader atxt">No matches for <b>interests</b>.</div>
    </g:else>

    <g:if test="${requests}">
      <div class="searchHeader atxt">Matching <b>collaboration requests:</b></div>
        
      <ul class="styledList">
        <g:each in="${requests}" var="r">
          <li>
            <g:link url = "#/?nodeId=r_${r.id}&navFunction=request&requestId=${r.id}&searchBox=">${r.title}</g:link>
          </li>
        </g:each>
        <g:if test="${totalRequests >10}">
          <a href="#/?searchPage=request_0" class="moreSearchResults"> (see all ${totalRequests} results...)</a>
        </g:if>
      </ul>
    </g:if>
    <g:elseif test="${totalRequests > 0}">
      <div class="searchHeader atxt">No <b>filtered</b> matches for <b>collaboration requests</b>.</div>
    </g:elseif>
    <g:else>
      <div class="searchHeader atxt">No matches for <b>collaboration requests</b>.</div>
    </g:else>

  </g:if>
</div>