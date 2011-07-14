<html>

<head>
    <title>Change password</title>

  <p:css name="macademiaJit"/>
  <g:include view="/layouts/headers.gsp"/>
  <p:css name="changePasswd"/>
</head>

<body>


    <g:render template="../templates/macademia/logo"/>
    <div id="main">
      <h2>Reset your password.</h2>

      <p>
        Enter your email address below to reset your password.  
      </p>

      <g:if test="${error}">
        <p class="alert">${error.encodeAsHTML()}</p>
      </g:if>

      <g:form params="[group : params.group]" action="changepasswordcomplete">
        <table>
          <tbody>

            <tr>
              <td><label for="email">Email address:</label></td>
              <td>
                <input type="input" size="30" id="email" name="email" class="easyinput"/>
              </td>
            </tr>

            <tr>
              <td/>
              <td>
                <input type="submit" name="submit" value="Reset password"/>
              </td>
            </tr>
          </tbody>
        </table>

        <div >
        </div>
      </g:form>
    </div>
    <g:render template="/templates/macademia/tagline"/>
</body>

</html>