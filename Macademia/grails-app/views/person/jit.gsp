<%@ page import="grails.converters.JSON" contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <meta content='IE=edge,chrome=1' http-equiv='X-UA-Compatible' />
    <meta content='width=device-width, initial-scale=1.0' name='viewport' />
    <link rel="shortcut icon" type="image/x-icon" href="/myfavicon.ico"/>
    <title>Macademia - Connecting colleagues who share research interests.</title>
    <g:render template="/layouts/headers"/>

    <g:javascript>
        macademia.igMap = ${igMap as JSON};
        $(document).ready(function() {
            macademia.pageLoad();
            macademia.serverLog('nav', 'initial', {'url' : location.href });
            var params = {
                'page' : 'jit'
            };
            macademia.serverLog('page', 'load', params);
        });
    </g:javascript>

</head>
<body>
    <div id='container'>
      <header>
        <div id="logo"></div>
        <span id="asteroids"></span>
        <nav>
            <ul>
                <m:ifNotLoggedIn>
                    <li><a class="listRequestLink" href="#">Collaboration Requests</a></li>
                    <li><g:link params="[group : params.group]" controller="account" action="createuser">Create Account</g:link></li>
                    <li><a id="login_link" href="#">Login</a></li>
                    <li><a href="/Macademia"><p:image alt="home" src="home.png" height="20"/></a></li>
                </m:ifNotLoggedIn>
                <m:ifLoggedIn>
                  <li>
                    <a href="#">Collaboration Requests</a>
                    <ul>
                      <li><a href="#" class="listRequestLink">View All Requests</a></li>
                      <li><a href="#" class="makeRequestLink">Create New Request</a></li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">${request.authenticated.fullName.encodeAsHTML()}</a>
                    <ul>
                      <li><m:personLink person="${request.authenticated}">View</m:personLink></li>
                      <li><g:link params="[group : params.group]" controller="account" action="edit">Edit Profile</g:link></li>
                      <li><g:link params="[group : params.group]" controller="account" action="changepassword">Change Password</g:link></li>
                      <li><g:link params="[group : params.group]" controller="account" action="logout" class="icon_cross">Logout</g:link></li>
                    </ul>
                  </li>
                  <li><a href="/Macademia"><p:image alt="home" src="home.png" height="20"/></a></li>
                </m:ifLoggedIn>
            </ul>
        </nav>
      </header>

      <div id='main' role='main'>
        <div id="wrapper">
            <div id="centerCol">
                <!-- Center Column -->
                <div id="content">
                    <div id="filters">
                        %{--<gif test="${params.density}">Hello World! params = ${params}</gif>--}%
                        <div id="density">
                            <div id="less"><a href="#">Fewer Results</a></div>
                            <div id="densitySlider">
                              <g:each in="${[1,2,3,4,5]}" var="i">
                                <g:if test="${i == 5}">
                                    <span id="density${i}" class="density densityLast"></span>
                                </g:if>
                                <g:else>
                                  <span id="density${i}" class="density"></span>
                                </g:else>
                              </g:each>
                            </div>
                            <div id="more"><a href="#">More Results</a></div>
                        </div>
                        <div id="collegeFilter" class="collegeFilterTrigger"><a id="collegeFilterLink" class="change" href="#"></a></div>
                    </div>
                    <div id="infovis">
                        <div id="empty">
                        Nobody has created a profile from the institution you selected.  Create your own by following the "register" link in the top right.
                        </div>
                    </div>
                    <div id="institutionKey">
                        <p>Edge color shows a person's primary institution:</p>
                        <div id="keyInstitutions"></div>
                    </div>
                    <span id="instKeyEntryTemplate"><span class='instColorTemplate'></span></span>
                </div>
            </div>

            <g:render template="/layouts/rightNav" />
        </div>
      </div>

      <g:render template="/layouts/footer" />

    </div>
</body>
</html>
