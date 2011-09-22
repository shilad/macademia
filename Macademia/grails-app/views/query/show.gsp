<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <p:javascript src='macademia.js.all'/>
  <p:css name="ui-lightness/jquery-ui-1.8.2.custom"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <p:css name="queryViz" media="all"/>
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    macademia.nbrviz.initQueryViz();
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
    <div id="queryWidget"><g:render template="addInterest"/></div>
</body>
</html>