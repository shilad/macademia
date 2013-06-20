<%@ page import="org.macademia.HomeController" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
%{--Testing--}%
<html class='no-js' lang='en' xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html"
      xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<!--<![endif]-->
<head>
    <meta name="layout" content="main"/>
    <r:require modules="consortia"/>
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
        <div>

            <table>
                <tr>
                    <td>
                        <div id ="hidename">
                        <table>
                            <tr>
                                <td>
                                    <h4> ${consortium}</h4>
                                </td>
                                <td style= "text-align: right; padding-right: 40; padding-top: 68; padding-left: 34;">
                                    <button id="hideNm">Edit</button>
                                </td>
                                </td>
                            </tr>
                            <tr>
                        </table>
                        </div>



                        <div id ="showeditname" style="display:none">
                            <table>
                                <tr>
                                    <td>
                                        <textarea rows="3" cols="18" class = "rounded-corners" id="name-text" name="text" style="margin-top: 2em; border: 2.4px solid #000000; font-weight: bold; font-size: 216%;"> ${consortium} </textarea>
                                    </td>
                                    <td style= "text-align: right; padding-right: 40; padding-top: 68; padding-left: 34;">

                                        <button id="saveName">Save</button>
                                    </td>
                                </tr>
                                <tr>
                            </table>
                        </div>

                    </td>

                    <td>
                        <div id= "hideimg">
                        <table>
                            <tr>
                            <td>
                        <div id= "cLogo" >
                            <a href="http://www.acm.edu/index.html"><r:img style="margin-left: 3em " dir='images/consortia' file="ACM.png" alt="ACM" /></a>
                        </div>
                                </td>
                            <td>
                        <div style= "text-align: right; vertical-align: bottom">
                            <button id="hidelogo">Edit</button>
                            </td>
                        </tr>
                        </table>
                        </div>

                        <div id = "showavatar" style="display: none">
                            <table>
                                <tr>
                                    <td>

                                        <r:img id= "image-sub" dir='images' file="no_avatar.jpg" alt="avatar"/>


                                    </td>
                                    <td>
                                        <div style= "text-align: right; vertical-align: bottom">
                                            <button>Save</button>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        </td>
                </tr>
            </table>


            <hr/>
            <div id="hideblurb">
            <table>
                <tr>
                    <p> <br>%{-- a tab --}%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Here is the paragraph describing the consortium.  Who knows how long it will be? Not me.  maybe Margaret G?  I bet I can write a whole paragraph with this rhyme scheme.  Have you seen the cat leap meme?  Last night I had a bad dream.  There was candy, cake, and ice cream, but all was not as well as it seemed.  Soon the creepy person from Scream was killdafffaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaafffsfffsssssssssing off everything, first he murdered Janine.  It was not cool, naw 'meen?</p>
                </tr>
                <tr>
                    <div style= "text-align: right; padding-right: 253;">
                        <button id="hide">Edit</button>
                    </div>
                </tr>
            </br>
            </table>
        </div>
            <div id="showeditblurb"style="display:none" >
                <table>
                    <tr>
                        <textarea rows="4" cols="118" class = "rounded-corners" id="blurb-text" name="text" style="border: 2.4px solid #000000;">Here is the paragraph describing the consortium.  Who knows how long it will be? Not me.  maybe Margaret G?   Who knows how long it will be? Not me.  maybe Margaret G?  I bet I can write a whole paragraph with this rhyme scheme.  Have you seen the cat leap meme?  I bet I can write</textarea>
                    </tr>
                    <tr>
                        </br>
                        <div style= "text-align: right; padding-right: 253;">
                            <button id="saveblurb">Save</button>
                        </div>
                    </tr>
                </br>
                </table>
            </div>
        </div>

    </div>

    <g:render template="/layouts/footer" />



</div>

</body>
</html>
