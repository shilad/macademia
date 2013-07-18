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

.interest {
    font: 13px Helvetica;
    fill: #DCDCDC;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>

    var gradientCircles = [
        {'id' : 31, 'color' : "red", 'r': 170, 'cx' : 375, 'cy' : 150, "stop-opacity":.3},
        {'id' : 10, 'color' : "yellow", 'r': 170, 'cx' : 150, 'cy' : 600, "stop-opacity":.3},
        {'id' : 19, 'color' : "blue", 'r': 170, 'cx' : 600, 'cy' : 600, "stop-opacity":.3},
        {'id' : 34, 'color' : "tan", 'r': 300, 'cx' : 375, 'cy' : 425, "stop-opacity":.5}
    ];
    var root = [{
        "id":7,
        'name':'Daenerys Targaryen',
        'pic' : '/Macademia/all/image/randomFake?foo',
        'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
        'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
        'type':'person',
        'r': 30,
        'color': 0.2,
        'interests': [
            {"id": 1, "name": "Drogon","r":10},
            {"id": 2, "name": "Rhaegal","r":10},
            {"id": 3, "name": "Viserion","r":10},
            {"id": 4, "name": "Jorah", "r":10},
            {"id": 5, "name": "Barristan", "r":10},
            {"id": 6, "name": "Daario", "r":10}
        ]
    }];
    var hubs = [[{
        "id":17,
        'name':'Jay',
//        'pic' : '/Macademia/all/image/randomFake?foo',
        'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
        'type':'interest',
        'r': 30,
        'color': 0.0,
        'cx' : 375,
        'cy' : 150,
        'interests': [
            {"id": 10, "name": "Music","r":10},
            {"id": 20, "name": "Loitering","r":10},
            {"id": 30, "name": "Hats","r":10},
            {"id": 40, "name": "Girls", "r":10},
            {"id": 50, "name": "Mary Jane", "r":10}
        ]
    }],
        [{
            "id":10,
            'name':'Silent Bob',
//            'pic' : '/Macademia/all/image/randomFake?foo',
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
            'type':'interest',
            'r': 30,
            'color': 0.16666,
            'cx' : 150,
            'cy' : 600,
            'interests': [
                {"id": 11, "name": "...","r":10},
                {"id": 22, "name": "...","r":10},
                {"id": 32, "name": "...","r":10},
                {"id": 42, "name": "hmmfph", "r":10},
                {"id": 52, "name": "...", "r":10},
                {"id": 62, "name": "...", "r":10}
            ]
        }],
        [{
            "id":10,
            'name':'Randall',
//            'pic' : '/Macademia/all/image/randomFake?foo',
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
            'type':'interest',
            'r': 30,
            'color':.66,
            'cx' : 600,
            'cy' : 600,
            'interests': [
                {"id": 13, "name": "Magazines","r":10},
                {"id": 23, "name": "Jokes","r":10},
                {"id": 33, "name": "Star Wars","r":10},
                {"id": 43, "name": "Movies", "r":10},
                {"id": 53, "name": "Reclaiming Words", "r":10},
                {"id": 63, "name": "Life", "r":10}
            ]
        }]];

    var hubModel = {
        id:7,
        cx:375,
        cy:425,
        hubRoot : root,
        children : root[0].interests,
        color : 0.7,
        distance: 100
    };






    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

    var viz = new MC.InterestViz({
      hubModel: hubModel,
      hubs: hubs,
      root: root,
      circles: gradientCircles,
      svg : svg,



    });


    viz.setGradients();
    viz.createsGradientCircles();
//    viz.createInterestLabels();
    viz.createInterestViz();

    viz.createPersonView();

    viz.createPeople();
    viz.getD3People();
    viz.createPersonLayoutView();
    viz.createClusterMap();


</r:script>

<svg>
</svg>
</body>
</html>