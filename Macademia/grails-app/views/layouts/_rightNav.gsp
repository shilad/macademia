<%@ page import="org.macademia.Person" %>
<div id="show" class="btxt">
  <a href="#/?navVisibility=true"><-show</a>
</div>
<div id="sidebar">
  <div id="wrapper">
    <div id="main">
      <m:ifNotLoggedIn>
        <div id="account" class="btxt">
          <a id="login_link" href="#">Login</a> &middot;
          <g:link params="[group : params.group]" controller="account" action="createuser" href="#">Register</g:link>  &middot;
          <a class="listRequestLink" id="listRequestLink" href="#">Collaboration requests</a>
        </div>
      </m:ifNotLoggedIn>
      <m:ifLoggedIn>
      <div id="account" class="btxt">
        <div class="btxt">
          logged in as <m:personLink person="${request.authenticated}"/> 
          (<g:link params="[group : params.group]" controller="account" action="logout" class="icon_cross">logout</g:link>)<br>
          <g:link params="[group : params.group]" controller="account" action="edit">edit profile</g:link> &middot;
          <a href="#" class="listRequestLink" id="makeRequestLink">collaboration requests</a> &middot;
          <a href="#" id="toggleControls">more</a>
        </div>
        <ul id="accountControlList" class="left topBorder bottomBorder styledList">
          <div id="moreDropdown">
            <li>
              <g:link params="[group : params.group]" controller="account" action="changepassword">Change password</g:link>
            </li>
          </div>
        </ul>
      </div>
      </m:ifLoggedIn>
      
      <div id="login" style="display: block;">
        <div class="flash">&nbsp;</div>

        <div id="local" class="localonlymethod">
          <form id="signin" name="signin" action="#">
            <div id="login_info_div" style="display: block;">
              <label for="email">Email:</label>
              <input type="text" tabindex="1" name="email" class="login_input" id="email"/>
              <label for="password">Password:</label>
              <input type="password" tabindex="2" name="password" class="login_input" id="password">
              <input type="submit" tabindex="3" value="Login" class="login_submit"><g:link params="[group : params.group]" controller="account" action="forgottenpassword" class="forgot_password">forgot password?</g:link>
            </div>
          </form>

          <div class="accountoptions">
            <g:link params="[group : params.group]" controller="account" action="forgottenpassword" class="textlink icon icon_flag_purple">forgot password?</g:link>
          </div>
        </div>
      </div>
      <g:render template="../templates/macademia/searchBar"/>
      <div id="rightContent" class="medium topBorder">
        <ul id="instruct_list" class="topBorder bottomBorder styledList">
          <li>
            <b>Click</b> on a name or interest to recenter.
          </li>
          <li>
            <b>Hover</b> over a name to show more info.
          </li>
          <li>
            <b>Search</b> below for a person or interest.
          </li>
        </ul>
        <div id="searchBoxDiv" class="atxt">
          &nbsp;
        </div>
        <div id="personIdDiv">
          &nbsp;
        </div>
        <div id="interestIdDiv">
          &nbsp;
        </div>
        <div id="requestIdDiv">
          &nbsp;
        </div>

      </div>





      <div id="loginDialog" class="jqmWindow">

      </div>
      <div id="registerDialog" class="jqmWindow">
        <div id="registerAjax">

        </div>
        <div id="registerScript">
        </div>
      </div>

      <div id="makeRequestDialog" class="jqmWindow">&nbsp;</div>

      <div id="listRequestDialog" class="jqmWindow">&nbsp;</div>

      <div id="editRequestDialog" class="jqmWindow">&nbsp;</div>

      <div class="jqmWindow padded2 medium btxt" id="filterDialog">&nbsp;</div>
    </div>
  <div id="hide" class="btxt">
    <a href="#/?navVisibility=false">hide-></a>
  </div>
  </div>
</div>
