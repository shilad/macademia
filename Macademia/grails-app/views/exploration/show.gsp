<%@ page import="grails.converters.JSON" contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"
  "http://www.w3.org/TR/REC-html40/loose.dtd">
<html>
<head>
  <title>Exploration Based Visualization</title>
  <g:include view="/layouts/headers.gsp"/>
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
  });
</g:javascript>
<body>
<div id='visualization'>
  main visualization here
</div>
</body>
<g:javascript >
    var json = ${json as JSON};
</g:javascript>
</html>