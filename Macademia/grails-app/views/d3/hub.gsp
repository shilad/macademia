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

    var root = [{
        "id":7,
        'name':'Daenerys Targaryen',
        'pic' : '/Macademia/all/image/randomFake?foo',
        'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
        'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
        'type':'person',
        'r': 20,
        'color': 0.2
    }];

    var interests = [
        {"id": 1, "name": "Drogon","r":5},
        {"id": 2, "name": "Rhaegal","r":5},
        {"id": 3, "name": "Viserion","r":5},
        {"id": 4, "name": "Jorah", "r":5},
        {"id": 5, "name": "Barristan", "r":5},
        {"id": 6, "name": "Daario", "r":5,"color":0.8}
    ];

    var hubmodel = {
        id:7,
        cx:300,
        cy:300,
        root : root,
        children : interests,
        color : 0.7,
        distance: 50
    };

    var template = MC.hub();

    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

    svg.datum(hubmodel)
            .call(template);

    var root2 = [{"id": 8, "name":"stark", "type":"interest", "r":20,"color":0.5}];

    var hubmodel2 = {
        id:8,
        cx:500,
        cy:200,
        root : root2,
        children : interests,
        color : 0.7,
        distance: 50
    };

    window.setTimeout(function() {
        svg.datum(hubmodel2)
                .call(template);

    }, 1500);

</r:script>

<svg>

</svg>

</body>
</html>