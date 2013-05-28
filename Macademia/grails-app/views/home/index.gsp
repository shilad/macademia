<%@ page import="org.macademia.HomeController" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class='no-js' lang='en'>
  <!--<![endif]-->
  <head>
    <meta name="layout" content="main"/>
    <r:require modules="core"/>
    <meta charset='utf-8' />
    <meta content='IE=edge,chrome=1' http-equiv='X-UA-Compatible' />
    <meta content='width=device-width, initial-scale=1.0' name='viewport' />
    <g:render template="/layouts/headers"/>
    <title>Macademia - Connecting colleagues who share research interests.</title>
    <g:javascript>
      $(document).ready(function() {
            macademia.homePageLoad();
            macademia.serverLog('page', 'load', {'page' : 'home'});
      });
    </g:javascript>
  </head>
  <body>
    <div id="homePage">
      <header>
      	<div id="headerWrapper">
	      	<div id="logo" title="Macademia">Macademia</div>
            <nav>
                <ul>
                    <m:ifNotLoggedIn>
                        <li><g:link params="[group : params.group]" controller="account" action="createuser">Create Account</g:link></li>
                        <li><a id="login_link" href="#">Login</a></li>
                    </m:ifNotLoggedIn>
                    <m:ifLoggedIn>
                        <li>
                          Logged in as <a href="#">${request.authenticated.fullName.encodeAsHTML()}</a>
                          <ul>
                            <li><m:personLink person="${request.authenticated}">View</m:personLink></li>
                            <li><g:link params="[group : params.group]" controller="account" action="edit">Edit Profile</g:link></li>
                            <li><g:link params="[group : params.group]" controller="account" action="changepassword">Change Password</g:link></li>
                            <li><g:link params="[group : params.group]" controller="account" action="logout" class="icon_cross">Logout</g:link></li>
                          </ul>
                        </li>
                    </m:ifLoggedIn>
                </ul>
            </nav>

            <div id="login">
                <div id="local" class="localonlymethod">
                  <form id="signin" name="signin" action="#">
                    <div id="login_info_div" style="display: block;">
                      <div>
                          <label for="email">Email:</label>
                          <input type="text" tabindex="1" name="email" class="login_input" id="email"/>
                      </div>
                      <div>
                          <label for="password">Password:</label>
                          <input type="password" tabindex="2" name="password" class="login_input" id="password">
                      </div>
                      <input type="submit" tabindex="3" value="Login" class="login_submit"><g:link params="[group : params.group]" controller="account" action="forgottenpassword" class="forgot_password">forgot password?</g:link>
                    </div>
                  </form>
                </div>
            </div>

	      	<h1>Macademia</h1>
	      	<h2>Connecting colleagues who share research interests</h2>
      	</div>
      </header>

      <div id='main' role='main'>

      	<div id="mainSearchBox">
      		<input type="text" id="searchBox" placeholder="Search for researchers or interests" />
      		<div id="searchSubmit" class="customButton"><a id="submitSearch" href="javascript:;">Search</a></div>
            <div id="consortia">
              <ul>
                <g:each in="${igs}" var="ig" status="i">
                  <g:if test="${i < 4}">
                    <li>
                      <label for="radio_${ig.abbrev}">
                        <input type="radio" name="consortia" id="radio_${ig.abbrev}" value="${ig.abbrev}"/>&nbsp;${ig.name.encodeAsHTML().replace(' ', '&nbsp;')}
                      </label>
                    </li>
                  </g:if>
                </g:each>
                <li>
                  <a href="#">more...</a>
                </li>
                <div class="more">
                  <g:each in="${igs}" var="ig" status="i">
                    <g:if test="${i >= 4}">
                    <li>
                      <label for="radio_${ig.abbrev}">
                        <input type="radio" name="consortia" id="radio_${ig.abbrev}" value="${ig.abbrev}"/>&nbsp;${ig.name.encodeAsHTML().replace(' ', '&nbsp;')}
                      </label>
                    </li>
                    </g:if>
                  </g:each>
                </div>
              </ul>
            </div>
      	</div>

      	<div id="slideshow">
      		<div id="slideshowReel">
	      		<div class="slide">
	      			<a href="/Macademia/acm"><r:img id="graphThumb" dir='images' file="thumbnailTest01.png" alt="Go to Macademia visualization"/></a>
	      		    <div id="entrancePortal">
                        <ul>
                          <g:each in="${people}" var="p"><li><m:personLink person="${p}" group="all"><m:personImage person="${p}"/></m:personLink></li></g:each>
                          <g:each in="${(people.size()..< HomeController.NUM_PEOPLE)}"><li><a href="#"><r:img dir='images' file="shilad.jpg"/></a></li></g:each>
                        </ul>
	      		    </div>
                    <h3>Find collaborators by searching for research interests</h3>
                    <p>Macademia visualizes your search results by showing connections between research topics and colleagues. Click on names or interests to recenter the visualization.</p>

                </div>
      		</div>
      	</div>



      	<div id="sponsors">
      		<h3>Macademia is generously funded by:</h3>
      		<ul>
                <li><a href="http://www.macalester.edu"><r:img dir='images' file="mac_logo2.png" alt="Macalester College" /></a></li>
                <li><a href="http://www.acm.edu/index.html"><r:img dir='images' file="logos_acm.png" alt="The American Colleges of the Midwest" /></a></li>
      			<li><a href="http://www.nsf.gov/"><r:img dir='images' file="logos_nsf.png" alt="The National Science Foundation" /></a></li>
      			<li><a href="http://www.mellon.org/"><r:img dir='images' file="logos_andrewMellon.png" alt="the Andrew Mellon Charitable Trust" /></a></li>
            </ul>
      	</div>

      </div>

      <g:render template="/layouts/footer" />

    </div>

  </body>
</html>
