<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <g:javascript >
    var vizJson = ${jsonData};
  </g:javascript>
  <g:include view="/layouts/headers.gsp"/>
  <link rel="stylesheet" type="text/css" href="../../css/queryViz.css" />
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    macademia.nbrviz.initQueryViz(vizJson);
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
    <div id="queryWidget"><g:include view="/query/_addInterest.gsp"/></div>
</body>
</html>