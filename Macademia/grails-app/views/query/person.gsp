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
    var interestGroups = [
            [new Interest({name : 'boxing', id : 3424, 'color' : .4}), .7, 3],
            [new Interest({name : 'boxing', id : 3425, 'color' : .7}), .3, 2]
    ];
    var s = new PersonCenter({
            innerRadius : 50,
            outerRadius : 75,
            imageWidth : 50,
            imageHeight : 50,
            picture : 'http://shilad.com/headshot.jpg',
            name : "test person",
            interestGroups : interestGroups,
            paper : paper,
            relevance : 0.5
    });
    s.setPosition(200, 200);
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
</body>
</html>