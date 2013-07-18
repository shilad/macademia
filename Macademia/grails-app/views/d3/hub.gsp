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

    //TODO: r doesn't adjust size for person
    var root1 = [{
        "id":7,
        'name':'Shilad Sen',
        'pic' : '/Macademia/all/image/randomFake?foo',
        'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
        'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
        'type':'person',
        'r': 30,
        'color': 0.6
    }];

    var interests1 = [
        {"id": 1, "name": "Jazz","r":13, "color": 0.3},
        {"id": 2, "name": "Data Mining","r":13},
        {"id": 3, "name": "Online Communities","r":13},
        {"id": 4, "name": "Machine Learning", "r":13},
        {"id": 5, "name": "Statistics", "r":13},
        {"id": 6, "name": "web2.0", "r":13}
    ];

    var hubmodel = {
        id:7,
        cx:300,
        cy:300,
        root : root1,
        children : interests1,
        color : 0.6,
        distance: 75
    };

    var template = MC.hub();

    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

    svg.datum(hubmodel)
            .call(template);

    var root2 = [{"id": 8, "name":"web2.0", "type":"interest", "r":38,"color":0.6}];

    var interests2 = [
        {"id": 1, "name": "html5","r":13},
        {"id": 2, "name": "javascript","r":13},
        {"id": 3, "name": "Web Development","r":13},
        {"id": 4, "name": "wikis", "r":13},
        {"id": 5, "name": "Web Spam", "r":13},
        {"id": 6, "name": "Semantic Web", "r":13}
    ];

    var hubmodel2 = {
        id:8,
        cx:500,
        cy:200,
        root : root2,
        children : interests2,
        color : 0.6,
        distance: 75
    };

        svg.datum(hubmodel2)
                .call(template);


</r:script>

<svg>

</svg>

</body>
</html>