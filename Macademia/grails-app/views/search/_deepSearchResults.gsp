<%--
  Created by IntelliJ IDEA.
  User: mnaminski
  Date: Jul 12, 2010
  Time: 11:20:28 AM
  To change this template use File | Settings | File Templates.
--%>

<g:setProvider library="jquery"/>
<div id="deepSearchWrapper" class="atxt">
  <div class="searchHeader">
    <g:if test="${results}">
      Matching <b>${type}</b> results for <b>${query}</b>:
    </g:if>
    <g:else>
      No <b>${type}</b> results found for <b>${query}.</b>
    </g:else>
    <a href="#/?searchPage=all_0">(back to all results)</a>
  </div>

  <g:if test="${results}">

    <g:if test= "${type == 'person'}">
      <ul id="personResults" class="styledList">
        <g:each in="${results}" var="p">
          <li class="personSearchResult">
            <g:link url = "#/?nodeId=p_${p.id}&navFunction=person&personId=${p.id}">${p.fullName}</g:link>
             <div class="personSearchInst" >${p.institution}</div>
             <div class="personSearchDept">${p.department}</div>
          </li>
        </g:each>
      </ul>
    </g:if>

    <g:elseif test= "${type == 'request'}">
      <ul id="requestResults" class="styledList">
        <g:each in="${results}" var="r">
          <li>
            <g:link  id ="requestTittle" url = "#/?nodeId=r_${r.id}&navFunction=request&requestId=${r.id}">${r.title}</g:link>
            <div >Request by: <g:link url="#/?nodeId=p_${r.creator.id}&navFunction=person&personId=${r.creator.id}">${r.creator.fullName}</g:link> on ${r.dateCreated.month + "/" +r.dateCreated.date + "/" + (r.dateCreated.year + 1900)}</div>
            <div>Expires:  ${r.expiration.month + "/" +r.expiration.date + "/" + (r.expiration.year + 1900)}</div>
            <g:if test = "${r.description.length() > 120}">
              <p>${r.description.substring(0,120) + "..."}</p>
            </g:if>
            <g:else>
              <p>${r.description}</p>
            </g:else>
          </li>
        </g:each>
      </ul>
    </g:elseif>

    <g:elseif test= "${type == 'interest'}">
      <ul id="interestResults" class="styledList">
        <g:each in="${results}" var="i">
          <li>
            <g:link url = "#/?nodeId=i_${i.id}&navFunction=interest&interestId=${i.id}">${i.text}</g:link>
          </li>
        </g:each>
      </ul>
    </g:elseif>

  </g:if>

</div>

<div id = "pageNav" class="atxt">
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