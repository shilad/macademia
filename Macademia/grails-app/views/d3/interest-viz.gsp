<%--
  Created by IntelliJ IDEA.
  User: jesse
  Date: 7/16/13
  Time: 2:04 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main"/>

    <r:require modules="d3js"/>

    <title></title>
</head>
<body>

<style type="text/css">

.hub {
    font: 13px Georgia;
    fill: #C0C0C0;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>

    var gradientCircles = [
        {'id' : 31, 'color' : "#b2a3f5", 'r': 170, 'cx' : 375, 'cy' : 150, "stop-opacity":.3},
        {'id' : 10, 'color' : "#b4f5a3", 'r': 170, 'cx' : 150, 'cy' : 600, "stop-opacity":.3},
        {'id' : 19, 'color' : "#f5a3d6", 'r': 170, 'cx' : 600, 'cy' : 600, "stop-opacity":.3},
        {'id' : 34, 'color' : "#D3D3D3", 'r': 300, 'cx' : 375, 'cy' : 425, "stop-opacity":.5}
    ];
    var root = [{
        "id":7,
        'name':'Shilad Sen',
        'pic' : '/Macademia/all/image/randomFake?foo',
        'cleanedRelevance':  {8 : 12.0, 9: 5.0, 10: 8.0, 7: 8.0},
        'interestColors': {8 : 'hsl(0, 0%, 82.7%)', 9 : 0.3, 10 : 0.9, 7: 0.7},
        'type':'person',
        'r': 45,
        'color': '#D3D3D3',
        'interests': [
            {"id": 3, "name": "Online Communities","r":18, "color":0.7},
            {"id": 6, "name": "web2.0", "r":18, "color":0.7},
            {"id": 1, "name": "Machine Learning", "r":18},
            {"id": 4, "name": "Jazz","r":18, "color": 0.3},
            {"id": 5, "name": "Statistics", "r":18, "color": 0.9},
            {"id": 2, "name": "Data Mining","r":18}
        ]
    }];
    var hubs = [[{
        "id": 8,
        "name":"web2.0",
        "type":"interest",
        "r": 45,
        "cx":375,
        "cy":150,
        "color":0.7,
        'interests': [
            {"id": 11, "name": "html5","r":18},
            {"id": 12, "name": "javascript","r":18},
            {"id": 13, "name": "Web Development","r":18},
            {"id": 14, "name": "wikis", "r":18},
            {"id": 15, "name": "Web Spam", "r":18},
            {"id": 16, "name": "Semantic Web", "r":18}
        ]
    }],
        [{
            "id":9,
            'name':'Jazz',
            'type':'interest',
            'r': 45,
            'color': 0.3,
            'cx' : 150,
            'cy' : 600,
            'interests': [
                {"id": 21, "name": "Miles Davis","r":18},
                {"id": 22, "name": "Jazz History","r":18},
                {"id": 23, "name": "Every Day","r":18},
                {"id": 24, "name": "Duke Ellington", "r":18},
                {"id": 25, "name": "Jazz Performance", "r":18},
                {"id": 26, "name": "Mary Lou Williams", "r":18}
            ]
        }],
        [{
            "id":10,
            'name':'Mathematics',
            'type':'interest',
            'r': 45,
            'color':0.9,
            'cx' : 600,
            'cy' : 600,
            'interests': [
                {"id": 13, "name": "Mathematical Methods","r":18},
                {"id": 23, "name": "Philosophy of Mathematics","r":18},
                {"id": 33, "name": "Geometry","r":18},
                {"id": 43, "name": "Algebra", "r":18},
                {"id": 53, "name": "Calculus", "r":18},
                {"id": 63, "name": "Discrete Mathematics", "r":18}
            ]
        }]];

    var hubModel = {
        id:7,
        cx:375,
        cy:425,
        hubRoot : root,
        children : root[0].interests,
        color: 'hsl(0, 0%, 82.7%)',
        distance: 100
    };



    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

    var viz = new MC.InterestViz({
      hubModel: hubModel,
      hubs: hubs,
      root: root,
      circles: gradientCircles,
      svg : svg
    });


    viz.setGradients();
    viz.createsGradientCircles();
//    viz.createInterestLabels();
    viz.createInterestViz();
</r:script>

<svg>
</svg>
</body>
</html>