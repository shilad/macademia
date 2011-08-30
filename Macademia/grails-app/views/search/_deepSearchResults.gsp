<g:setProvider library="jquery"/>
<div id="deepSearchWrapper">
  <div class="searchHeader">
    <g:if test="${results}">
      <h1 class="searchTitle">Matching <span class="searchAttention">${type}</span> results for <span class="searchAttention">${query}</span>:</h1>
    </g:if>
    <g:else>
      <h1 class="searchTitle">No <span class="searchAttention">${type}</span> results found for <span class="searchAttention">${query}</span></h1>
    </g:else>
    <a href="#/?searchPage=all_0">(back to all results)</a>
  </div>

  <g:if test="${results}">

    <g:if test= "${type == 'person'}">
      <div class="sidebarSection">
        <h2>Matching People:</h2>
        <ul id="personResults">
          <g:each in="${results}" var="p">
            <li class="personSearchResult">
              <g:link url = "#/?nodeId=p_${p.id}&navFunction=person&personId=${p.id}">
                  ${p.fullName}
                  <div class="personSearchInst" >${p.retrievePrimaryInstitution()}</div>
                  <div class="personSearchDept">${p.department}</div>
              </g:link>
            </li>
          </g:each>
        </ul>
      </div>
    </g:if>

     <g:elseif test= "${type == 'interest'}">
       <div class="sidebarSection">
         <h2>Matching Interests:</h2>
         <ul id="interestResults">
           <g:each in="${results}" var="i">
             <li>
               <g:link url = "#/?nodeId=i_${i.id}&navFunction=interest&interestId=${i.id}">${i.text}</g:link>
             </li>
           </g:each>
         </ul>
       </div>
     </g:elseif>

    <g:elseif test= "${type == 'request'}">
      <div class="sidebarSection">
        <h2>Matching Collaboration Requests:</h2>
        <ul>
          <g:each in="${results}" var="r">
            <li>
              <g:link  class ="requestTitle" url = "#/?nodeId=r_${r.id}&navFunction=request&requestId=${r.id}">${r.title}</g:link>
              <div class="requestCreationInfo">Request by: <g:link url="#/?nodeId=p_${r.creator.id}&navFunction=person&personId=${r.creator.id}">${r.creator.fullName}</g:link> on ${r.dateCreated.month + "/" +r.dateCreated.date + "/" + (r.dateCreated.year + 1900)}</div>
              <div>Expires:  ${r.expiration.month + "/" +r.expiration.date + "/" + (r.expiration.year + 1900)}</div>
              <g:if test = "${r.description.length() > 120}">
                <p class="requestDescription">${r.description.substring(0,120) + "..."}</p>
              </g:if>
              <g:else>
                <p class="requestDescription">${r.description}</p>
              </g:else>
            </li>
          </g:each>
        </ul>
      </div>
    </g:elseif>
  </g:if>

  <div id = "pageNav">
      <g:if test="${index <= 0}">
         << First | < Previous |
      </g:if>
      <g:else>
        <a href="#/?searchPage=${type + '_' + 0}" id = "firstPage"><< First</a> |
        <a href="#/?searchPage=${type + '_' + (index - 1)}" id = "previousPage"> < Previous</a> |
      </g:else>
      <g:if test="${index  >= total - 1}">
         Next > |
         Last >>
      </g:if>
      <g:else>
        <a href="#/?searchPage=${type + '_' + (index + 1)}" id = "nextPage"> Next ></a> |
        <a href="#/?searchPage=${type + '_' + total.toInteger()}" id = "lastPage"> Last >></a>
      </g:else>
  </div>
  
</div>