<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Exploration Based Visualization</title>
  <g:javascript >
    var vizJson = ${jsonData};
  </g:javascript>
  <g:include view="/layouts/headers.gsp"/>
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
  });
</g:javascript>
<body>
<div id="graph"></div>
</body>
</html>