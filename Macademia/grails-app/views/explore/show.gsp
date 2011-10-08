<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <p:css name="nbrviz/jquery-ui-1.8.16.custom"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <p:css name="queryViz" media="all"/>
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    macademia.nbrviz.explore.initViz();
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
    <div id="adjustmentWidget"><g:render template="adjustInterests"/></div>
  <g:render template="/layouts/loading"/>
</body>
</html>