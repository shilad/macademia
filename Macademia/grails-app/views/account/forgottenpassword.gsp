<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
<html>

<head>
  <title>Change password</title>

  <g:render template="/layouts/headers"/>

  <g:javascript>
      $(document).ready(function() {
          macademia.initLogoLink();
      });
  </g:javascript>
</head>

<body>

    <header><div id="logo"></div></header>

    <div id="passwordForgot">
        <div id="main">
          <h2>Reset your password.</h2>

          <p>
            Enter your email address below to reset your password.
          </p>

          <g:if test="${error}">
            <p class="alert">${error.encodeAsHTML()}</p>
          </g:if>

          <g:form params="[group : params.group]" action="forgottenpasswordcomplete">
            <table id="resetPass">
              <tbody>

                <tr>
                  <td><label for="email">Email address:</label></td>
                  <td>
                    <input type="input" size="30" id="email" name="email" class="easyinput"/>
                  </td>
                </tr>

                <tr>
                  <td></td>
                  <td>
                    <input type="submit" name="submit" value="Reset password"/>
                    <input type="button" value="Cancel" onclick="location.href = '/Macademia/${params.group}'" />
                  </td>
                </tr>
              </tbody>
            </table>

            <div >
            </div>
          </g:form>
        </div>
    </div>

    <g:render template="../layouts/footer"/>

</body>

</html>