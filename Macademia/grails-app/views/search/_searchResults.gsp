<g:setProvider library="jquery"/>
<div id="searchWrapper">
  <div class="searchHeader">
    <g:if test="${people || interests || requests}">
      <h1 class="searchTitle">Results matching <span class="searchAttention">${query.encodeAsHTML()}</span>:</h1>
    </g:if>
    <g:elseif test="${institutions != 'all institutions' && (totalPeople != 0 || totalInterests != 0 || totalRequests != 0)}">
      <h1 class="searchTitle">No <span class="searchAttention">filtered</span> search results found for <span class="searchAttention">${query.encodeAsHTML()}</span></h1>
    </g:elseif>
    <g:else>
      <h1 class="searchTitle">No search results found for <span class="searchAttention">${query.encodeAsHTML()}</span></h1>
    </g:else>
  </div>

  <div class="sidebarSection">
    <g:if test="${people}">
        <h2 class="searchTitle">Matching people:</h2>
        <ul>
          <g:each in="${people}" var="p">
            <li>
              <g:link url = "#/?nodeId=p_${p.id}&navFunction=person&personId=${p.id}&searchBox=">${p.fullName}</g:link>
            </li>
          </g:each>
        </ul>
        <g:if test="${totalPeople > 10}">
            <a href="#/?searchPage=person_0" class="moreSearchResults"> (see all ${totalPeople} results...)</a>
        </g:if>
    </g:if>
    <g:elseif test="${totalPeople > 0}">
        <h2 class="searchTitle">No <span class="searchAttention">filtered</span> matches for people</h2>
    </g:elseif>
    <g:else>
        <h2 class="searchTitle">No matches for people</h2>
    </g:else>
  </div>

  <div class="sidebarSection">
    <g:if test="${interests}">
        <h2 class="searchTitle">Matching interests:</h2>
        <ul>
          <g:each in="${interests}" var="i">
            <li>
              <g:link url = "#/?nodeId=i_${i.id}&navFunction=interest&interestId=${i.id}&searchBox=">${i.text}</g:link>
            </li>
          </g:each>
        </ul>
        <g:if test="${totalInterests > 10}">
            <a href="#/?searchPage=interest_0" class="moreSearchResults"> (see all ${totalInterests} results...)</a>
        </g:if>
    </g:if>
    <g:elseif test="${totalInterest > 0}">
        <h2 class="searchTitle">No <span class="searchAttention">filtered</span> matches for interests</h2>
    </g:elseif>
    <g:else>
        <h2 class="searchTitle">No matches for interests</h2>
    </g:else>
  </div>

  <div class="sidebarSection">
    <g:if test="${requests}">
        <h2 class="searchTitle">Matching collaboration requests:</h2>
        <ul>
          <g:each in="${requests}" var="r">
            <li>
              <g:link url = "#/?nodeId=r_${r.id}&navFunction=request&requestId=${r.id}&searchBox=">${r.title}</g:link>
            </li>
          </g:each>
        </ul>
        <g:if test="${totalRequests > 10}">
          <a href="#/?searchPage=request_0" class="moreSearchResults"> (see all ${totalRequests} results...)</a>
        </g:if>

    </g:if>
    <g:elseif test="${totalRequests > 0}">
        <h2 class="searchTitle">No <span class="searchAttention">filtered</span> matches for collaboration requests</h2>
    </g:elseif>
    <g:else>
        <h2 class="searchTitle">No matches for collaboration requests</h2>
    </g:else>
  </div>

</div>