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
          var params = {
              'page' : 'changepassword',
              fromEmail : '${currentPassword != null}'
          };
          macademia.serverLog('page', 'load', params);
      });
  </g:javascript>
</head>

<body>

    <header><div id="logo"></div></header>

    <div id="passwordEdit">
    <div id="main">
      <h2>Change your password</h2>


        <g:if test="${currentPassword}">
          <p>Thanks for updating your Macademia profile!<br/><br/>

          You first need to create a new password for your account.<br/>
          Afterwards, you can update your profile.
          </p>

        </g:if>

      <g:if test="${error}">
        <p class="alert">${error.encodeAsHTML()}</p>
      </g:if>

      <g:form params="[group : params.group]" action="changepasswordcomplete">
        <table>
          <tbody>
            <g:if test="${currentPassword}">
              <input type="hidden" name="currentPassword" value="${currentPassword}"/>
              <input type="hidden" name="fromEmail" value="true"/>
            </g:if>
            <g:else>
            <tr>
              <td><label for="currentPassword">Current password:</label></td>
              <td>
                <input type="password" size="30" id="currentPassword" name="currentPassword" class="easyinput"/>
              </td>
            </tr>
            </g:else>

            <tr>
              <td><label for="password">New password:</label></td>
              <td>
                <input type="password" size="30" id="password" name="password" class="password easyinput"/>
              </td>
            </tr>

            <tr>
              <td><label for="passwordConfirm">Confirm new password:</label></td>
              <td>
                <input type="password" size="30" id="passwordConfirm" name="passwordConfirm" class="easyinput"/>
              </td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>
                <input type="submit" name="submit" value="Change password"/>
                <input type="button" value="Cancel" onclick="location.href = '/Macademia/${params.group}'" />
              </td>
            </tr>
          </tbody>
        </table>
          <p>
          Your new password must be at least six letters long.
          </p>

        <g:if test="${currentPassword}">
          <p>
        </g:if>
        <div >
        </div>
      </g:form>
    </div>
    </div>

    <g:render template="../layouts/footer"/>

</body>

</html>