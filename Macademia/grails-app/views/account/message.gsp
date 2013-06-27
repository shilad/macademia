<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<!--[if lt IE 7]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if gt IE 8]><!-->
<html>

<head>
  <title>${title.encodeAsHTML()}</title>

  <g:render template="/layouts/headers"/>

  <r:script>
      $(document).ready(function() {
          macademia.initLogoLink();
      });
  </r:script>
</head>

<body>

    <header><div id="logo"></div></header>

    <div id="message">
        <div id="main">
          <h2>${title.encodeAsHTML()}</h2>

          <g:if test="${error}">
            <p class="alert">${error.encodeAsHTML()}</p>
          </g:if>

          <p>${message.encodeAsHTML()}</p>

          <p>
            <m:ifLoggedIn ><a href="/Macademia/${params.group}/person/jit/#/?nodeId=p_${request.authenticated.id}&amp;institutions=all">Return to Macademia</a></m:ifLoggedIn>
            <m:ifNotLoggedIn><a href="/Macademia/${params.group}">Return to Macademia</a></m:ifNotLoggedIn>
          </p>
        </div>
    </div>
    <g:render template="../layouts/footer"/>
</body>

</html>