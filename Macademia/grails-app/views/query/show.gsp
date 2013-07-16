<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <p:css name="nbrviz/jquery-ui-1.8.16.custom"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <p:css name="queryViz" media="all"/>
</head>
<r:script>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    var viz = new QueryViz({
      x: 0,
      y : 0,
      width : $(window).width(),
      height : $(window).height()
    });
  });
</r:script>
<body>
    %{--<div id="graph">&nbsp;</div>--}%
    <div id="queryWidget"><g:render template="addInterest"/></div>
  <g:render template="/layouts/loading"/>
</body>
</html>