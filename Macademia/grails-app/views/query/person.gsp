<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Query Based Visualization</title>
  <g:include view="/layouts/headers.gsp"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <link rel="stylesheet" type="text/css" href="../css/queryViz.css" />
</head>
<g:javascript>
  $().ready(function() {
    var paper = macademia.nbrviz.initPaper(1000, 1000);
    var interestGroups = [
            [new Interest({name : 'boxing', id : 3424, 'color' : .4}), .7, .4],
            [new Interest({name : 'boxing 2', id : 3425, 'color' : .7}), .3, .6]
    ];
    var s = new PersonCenter({
            innerRadius : 50,
            outerRadius : 75,
            imageHeight : 50,
            picture : 'http://shilad.com/headshot.jpg',
            name : "test person",
            interestGroups : interestGroups,
            paper : paper,
            x : 200,
            y : 200,
            scale : 1.8,
            relevance : 0.5
    });
//    s.stop();

    window.setTimeout(function() {
          s.animate({scale : 1.1}, 100);
    }, 1000);
//    s.setPosition(200, 200);
  });
</g:javascript>
<body>
    <div id="graph">&nbsp;</div>
</body>
</html>