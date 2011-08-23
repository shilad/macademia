<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <g:include view="/layouts/headers.gsp"/>
  <link rel="stylesheet" type="text/css" href="../css/queryViz.css" />
</head>
<g:javascript>
  $().ready(function() {
    var paper = macademia.nbrviz.initPaper( "graph",
                                            $("#graph").width(),
                                            $("#graph").height());
    var s = new Sphere({
            x : 300,
            y : 300,
            r : 75,
            hue : 0.1,
            xOffset : 50,
            yOffset : 50,
            name : "test sphere",
            paper : paper
    });
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
</body>
</html>