<%@ page import="org.macademia.HomeController" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
%{--Testing--}%
<html class='no-js' lang='en' xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
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
<div id="consortiaHome">
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
        </br>
        </br>
        </br>
        </br>
        <div>
            <table>
                <tr>
                    <td>
                        <table>
                            <tr>
                                <h4> Associated Colleges of the Midwest</h4>
                            </tr>
                            <tr>
                                <div id="slideshow">
                                    <div id="slideshowReel">
                                        <div class="slide">
                                            <div id="entrancePortal">

                                                    <g:each in="${people}" var="p"><li><m:personLink person="${p}" group="all"><m:personImage person="${p}"/></m:personLink></li></g:each>
                                                    <g:each in="${(people.size()..< HomeController.NUM_PEOPLE)}"><li><a href="#"><r:img dir='images' file="shilad.jpg"/></a></li></g:each>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </tr>
                        </table>
                    </td>
                    <td>
                        <div>
                            <a href="http://www.acm.edu/index.html"><r:img dir='images/consortia' file="ACM.png" alt="ACM" /></a>
                        </div>
                    </td>
                </tr>
            </table>

        </div>




        <div id = "mainSearchBox">
            <table>
                <tr>
                    <td>
                        <input type="text" id="searchBox" placeholder="Search for researchers or interests" />
                        <div id="searchSubmit" class="customButton"><a id="submitSearch" href="javascript:;">Search</a></div>
                    </td>
                    <td>
                        <table>
                            <tr>
                                <td>
                                    <input type="radio" name="radio" class="styled" style="margin-left: 18px; margin-top: 5px;"/>
                                </td>
                                <td>
                                    <p style="margin-left: 5px; font-size: 15;"> ACM Members</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="radio" name="radio" class="styled" style="margin-left: 18px; margin-top: 12px;"/>
                                </td>
                                <td>
                                    <p style="margin-left: 5px;margin-top: 6px; font-size: 15;"> All Members</p>
                                </td>
                            </tr>
                        </table>
                </tr>
            </table>

            %{-- the button--}%
            %{-- <a style="text-align: right" href="http://macademia.macalester.edu/Macademia/" class="macaButton" >Macademia Homepage</a>
             --}%
            %{--<a style="text-align: right" href="#" class="macaButton" >Macademia Homepage</a>--}%

        </div>

        %{-- the paragraph describing the consortium--}%
        <div>

            <hr/>
              <h5>Associated Colleges of the Midwest</h5>


            <p> <br>%{-- a tab --}%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Here is the paragraph describing the consortium.  Who knows how long it will be? Not me.  maybe Margaret G?  I bet I can write a whole paragraph with this rhyme scheme.  Have you seen the cat leap meme?  Last night I had a bad dream.  There was candy, cake, and ice cream, but all was not as well as it seemed.  Soon the creepy person from Scream was killing off everything, first he murdered Janine.  It was not cool, naw 'meen?</p>
        </br>
        </br>

        </div>

        <div>
            <h5 style="text-align: center">Beloit College, Carelton College, Coe College, Colorado College, Cornell College, Grinnell College, Knox College, Lake Forest College, Lawrence University, Luther College, Macalester College, Monmouth College, Ripon College, St. Olaf College</h5>
        </br>
            <hr />
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