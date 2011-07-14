<html>

<head>
  <title>${title.encodeAsHTML()}</title>
  <p:css name="macademiaJit"/>
  <g:include view="/layouts/headers.gsp"/>
  <p:css name="message"/>
</head>

<body>
  <g:render template="../templates/macademia/logo"/>
  <div id="main">
      <h2>${title}</h2>

      <g:if test="${error}">
        <p class="alert">${error.encodeAsHTML()}</p>
      </g:if>

      <p>${message.encodeAsHTML()}</p>

      <p>
        <m:ifLoggedIn ><a href="/Macademia/${params.group}/person/jit/#/?nodeId=p_${request.authenticated.id}&institutions=all">Return to Macademia</a></m:ifLoggedIn>
        <m:ifNotLoggedIn><a href="/Macademia/${params.group}">Return to Macademia</a></m:ifNotLoggedIn>
      </p>
    </div>
    <g:render template="/templates/macademia/tagline"/> 
</body>

</html>