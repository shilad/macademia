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

    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

    var hubCircles = [
        {'id' : 34, 'type' : "person", 'name' : 'Eevee', 'color' : "tan", 'r': 30, 'cx' : 375, 'cy' : 425},
        {'id' : 31, 'type' : "person",'name' : 'Flareon', 'color' : "red", 'r': 30, 'cx' : 375, 'cy' : 150},
        {'id' : 10, 'type' : "person",'name' : 'Jolteon', 'color' : "yellow", 'r': 30, 'cx' : 150, 'cy' : 600},
        {'id' : 19, 'type' : "person",'name' : 'Vaporeon', 'color' : "blue", 'r': 30, 'cx' : 600, 'cy' : 600}
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
    var hubs = [{
        "id":17,
        'name':'Jay',
        'pic' : '/Macademia/all/image/randomFake?foo',
        'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
        'type':'interest',
        'r': 30,
        'color': 0.2,
        'interests': [
            {"id": 10, "name": "Music","r":10},
            {"id": 20, "name": "Loitering","r":10},
            {"id": 30, "name": "Hats","r":10},
            {"id": 40, "name": "Girls", "r":10},
            {"id": 50, "name": "Mary Jane", "r":10}
        ]
    },
        {
            "id":10,
            'name':'Silent Bob',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
            'type':'interest',
            'r': 30,
            'color': 0.2,
            'interests': [
                {"id": 11, "name": "...","r":10},
                {"id": 22, "name": "...","r":10},
                {"id": 32, "name": "...","r":10},
                {"id": 42, "name": "hmmfph", "r":10},
                {"id": 52, "name": "...", "r":10},
                {"id": 62, "name": "...", "r":10}
            ]
        }
        ,
        {
            "id":10,
            'name':'Randall',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7},
            'type':'interest',
            'r': 30,
            'color': 0.2,
            'interests': [
                {"id": 13, "name": "Magazines","r":10},
                {"id": 23, "name": "Jokes","r":10},
                {"id": 33, "name": "Star Wars","r":10},
                {"id": 43, "name": "Movies", "r":10},
                {"id": 53, "name": "Reclaiming Words", "r":10},
                {"id": 63, "name": "Life", "r":10}
            ]
        }];


    var hubmodel = {
        id:7,
        cx:300,
        cy:300,
        hubRoot : root,
        children : root.interests,
        color : 0.7,
        distance: 55
    };

//    var template = MC.hub();
//    var hubs = svg.datum(hubmodel)
//            .call(template);


    var viz = new MC.InterestViz({
      hubModel: hubmodel,
      hubs: hubs,
      root: root,
      circles: hubCircles,
      svg : svg
    });




    viz.setGradients();
    viz.createsGradientCircles();
    viz.createInterestLabels();
    viz.createHub();

</r:script>

<svg>
</svg>
</body>
</html>