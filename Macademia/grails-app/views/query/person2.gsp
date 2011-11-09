<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Person sphere test</title>
  <g:include view="/layouts/headers.gsp"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <link rel="stylesheet" type="text/css" href="../css/queryViz.css" />
</head>
<g:javascript>
  $().ready(function() {
    var paper = macademia.nbrviz.initPaper( $("#graph").width(), $("#graph").height());
    var s = new PersonSphere({
            r : 75,
            imageHeight : 50,
            picture : 'http://shilad.com/headshot.jpg',
            id : 15,
            x : 300,
            y : 300,
            name : "test person",
            paper : paper
    });
    s.animate({ x : 500, y : 500, scale : 2.0, fill : '#f00'}, 1000);
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
</body>
</html>