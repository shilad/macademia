<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <g:javascript >
    var vizJson = ${jsonData};
  </g:javascript>
  <g:include view="/layouts/headers.gsp"/>

<style type="text/css">
html,body { height:100%; }
#graph { width : 100%; height : 100%; }
</style>

</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    macademia.nbrviz.initQueryViz(vizJson);
  });
</g:javascript>
<body>
    <g:include view="/query/_addInterest.gsp"/>
    <div id="graph">&nbsp;</div>
</body>
</html>