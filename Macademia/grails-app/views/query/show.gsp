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
    var paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());
    var viz = new QueryViz({ paper : paper });  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
    <div id="queryWidget"><g:render template="addInterest"/></div>
  <g:render template="/layouts/loading"/>
</body>
</html>