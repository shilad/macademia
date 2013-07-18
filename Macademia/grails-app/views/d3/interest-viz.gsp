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

    var hubCircles = [
        {'id' : 34, 'type' : "person", 'name' : 'Eevee', 'color' : "tan", 'r': 30, 'cx' : 375, 'cy' : 425},
        {'id' : 31, 'type' : "person",'name' : 'Flareon', 'color' : "red", 'r': 30, 'cx' : 375, 'cy' : 150},
        {'id' : 10, 'type' : "person",'name' : 'Jolteon', 'color' : "yellow", 'r': 30, 'cx' : 150, 'cy' : 600},
        {'id' : 19, 'type' : "person",'name' : 'Vaporeon', 'color' : "blue", 'r': 30, 'cx' : 600, 'cy' : 600}
    ];
    var viz = new MC.InterestViz({
      circles: hubCircles,
      svg : d3.select('svg')
    });


    viz.setGradients();
    viz.createsGradientCircles();
    viz.createInterestLabels();
</r:script>

<svg>
</svg>
</body>
</html>