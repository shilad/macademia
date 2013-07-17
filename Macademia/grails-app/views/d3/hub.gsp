<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 7/16/13
  Time: 10:41 AM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title></title>
    <meta name="layout" content="main"/>
    <r:require modules="d3js"/>
</head>
<body>

<style type="text/css">
.hub {
    font: 13px Georgia;
    fill: #000;
}
svg {
    height : 90%;
    width : 90%;
}
</style>

<r:script>

    var root = [{"id": 7, "name":"stark", "type":"interest","cx":300,"cy":300,"r":20,"color":0.5}];

    var interests = [
        {"id": 1, "name": "robb","r":5},
        {"id": 2, "name": "sansa","r":5},
        {"id": 3, "name": "arya","r":5},
        {"id": 4, "name": "bran", "r":5},
        {"id": 5, "name": "rickon", "r":5},
        {"id": 6, "name": "jon snow", "r":5},
        {"id": 7, "name": "catlyn", "r":5},
        {"id": 8, "name": "ned", "r":5},
    ];

    var hubmodel = {
        root : root,
        children : interests,
        color : 0.4
    };

    var template = MC.hub();

    var svg = d3.select('svg');

    svg.attr('width', 1000)
       .attr('height', 1000)
       .datum(hubmodel)
       .call(template);

</r:script>

<svg>

</svg>

</body>
</html>