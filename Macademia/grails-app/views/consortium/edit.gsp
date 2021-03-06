<%@ page import="org.macademia.HomeController" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
%{--Testing--}%
<html class='no-js' lang='en' xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html">
<!--<![endif]-->
<head>
    <meta name="layout" content="main"/>
    <r:require modules="profile"/>
    <meta charset='utf-8'/>
    <meta content='IE=edge,chrome=1' http-equiv='X-UA-Compatible'/>
    <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
    <g:render template="/layouts/headers"/>
    <title>Macademia - Connecting colleagues who share research interests.</title>

    <r:script>
        $(document).ready(function () {
            macademia.initLogoLink();
            macademia.initializeTopNav();
            macademia.initializeLogin();
            macademia.initInstitutionGroups();
            macademia.upload.init();
            macademia.serverLog('page', 'load', {'page': 'home'});
        });
    </r:script>
</head>

<body>
<div id="consortiaEdit">
    <header>
        <div id="headerWrapper">
            <div id="logo" title="Macademia">Macademia</div>
            <nav>
                <ul>
                    <m:ifNotLoggedIn>
                        <li><g:link params="[group: params.group]" controller="account"
                                    action="createuser">Create Account</g:link></li>
                        <li><a id="login_link" href="#">Login</a></li>
                    </m:ifNotLoggedIn>
                    <m:ifLoggedIn>
                        <li>
                            Logged in as <a href="#">${request.authenticated.fullName.encodeAsHTML()}</a>
                            <ul>
                                <li><m:personLink person="${request.authenticated}">View</m:personLink></li>
                                <li><g:link params="[group: params.group]" controller="account"
                                            action="edit">Edit Profile</g:link></li>
                                <li><g:link params="[group: params.group]" controller="account"
                                            action="changepassword">Change Password</g:link></li>
                                <li><g:link params="[group: params.group]" controller="account" action="logout"
                                            class="icon_cross">Logout</g:link></li>
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
                            <input type="submit" tabindex="3" value="Login" class="login_submit"><g:link
                                params="[group: params.group]" controller="account" action="forgottenpassword"
                                class="forgot_password">forgot password?</g:link>
                        </div>
                    </form>
                </div>
            </div>

            <h1>Macademia</h1>

            <h2>Connecting colleagues who share research interests</h2>
        </div>
    </header>

<div id="main">
</br>
    <g:form params="[group: params.group]" action="save" method="post">

        <table>
            <tr>
                <td width=33%>
                    <div id="showeditname">
                        <table>
                            <tr>
                                <td>
                                    <input class="rounded-corners" name="nameText"
                                              style="width: 17em; margin-top: 4em; border: 2.4px solid #000000; font-weight: bold; font-size:20;" value= "${institutionGroup.name.encodeAsHTML()}" >

                                </td>
                            </tr>
                        </table>
                    </div>

                </td>

                <td width=26%>

                    <div style="margin-left: 5.5em;margin-top:6em;">
                        <g:render template="../templates/macademia/imageUploader"/>
                    </div>

                </td>
                <td width=33%>
                    <g:if test="${institutionGroup.webUrl == null || institutionGroup.webUrl == ""}">
                        <input class="rounded-corners" name="webUrl"
                               style="width: 17em; margin-top: 4em;margin-left: .7em; border: 2.4px solid #000000; font-weight: bold; font-size: 20" placeholder="Type Url here">
                    </g:if>
                    <g:else>
                         <input class="rounded-corners" name="webUrl"
                                  style="width: 17em; margin-top: 4em;margin-left: .7em; border: 2.4px solid #000000; font-weight: bold; font-size: 20;" value= "${institutionGroup.webUrl.encodeAsHTML()}">
                    </g:else>
                </td>
            </tr>
        </table>




        <hr/>

        <div id="showeditblurb">
            <table>
                <tr>
                    <g:if test="${institutionGroup.description == null || institutionGroup.description == ""}">

                        <textarea rows="4" cols="118" class="rounded-corners" name="blurbText"
                                  style="border: 2.4px solid #000000;" placeholder="Type description here"></textarea>
                    </g:if>

                    <g:else>
                        <textarea rows="4" cols="118" class="rounded-corners" name="blurbText"
                                  style="border: 2.4px solid #000000;">${institutionGroup.description.encodeAsHTML()}</textarea>

                    </g:else>

                </tr>

                <tr>
                </br>
                    <div style="text-align: right; padding-right: 253;">

                    </div>
                </tr>
            </br>
            </table>

        </div>
        </div>

        <div id="submit_edits" style= "margin-left : 46%">

            <input style="margin-right: 1em" type="submit" name="Save" value="Update" />

            <input type="button" value="Cancel" onclick="location.href = '/Macademia/${params.group}/home/consortia'" />
            </br>
        </br>
        </div>
    </g:form>
</div>



<g:render template="/layouts/footer"/>

</body>
</html>
