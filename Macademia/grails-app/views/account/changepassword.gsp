<html>

<head>
    <title>Change password</title>

  <p:css name="macademiaJit"/>
  <g:include view="/layouts/headers.gsp"/>
  <p:css name="changePasswd"/>
</head>

<body>

    <a href="/Macademia/${params.group}"><p:image id="logoImage" src='macademia-logo.png'/></a>
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
                <input type="password" size="30" id="password" name="password" class="password easyinput"/></a>
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
    <g:render template="/templates/macademia/tagline"/>
    <g:javascript >
      $().ready(function() {
          var params = {
              'page' : 'changepassword',
              fromEmail : '${currentPassword != null}'
          };
          macademia.serverLog('page', 'load', params);
      });
    </g:javascript>
</body>

</html>