<%--
  Created by IntelliJ IDEA.
  User: henrycharlton
  Date: Jun 15, 2010
  Time: 2:29:06 PM
  To change this template use File | Settings | File Templates.
--%>



<div id="searchDiv">
  <%--<g:formRemote id="searchForm"
          name="searchForm"
          url="[action:'search', controller:'search']"
          update="rightContent">
    <br>--%>
  <form method="POST" action="#" id="searchForm" name="searchForm" update="searchBoxDiv">
    <input type="text" id="searchBox" name="searchBox" class="clearDefault" prompt="Search for people or interests"/>
    <input type="submit" id="searchSubmitButton" value="Search"/>
  </form>
  <%--</g:formRemote>--%>
</div>

<div id="collegeFilterButton" class="collegeFilterTrigger" >
  Showing <span>all schools</span>. (<a href="#" class="change">change</a>)
</div>
