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
        {'id' : 34, 'name' : 'Espeon', 'color' : "red", 'r': 50, 'cx' : 50, 'cy' : 200},
        {'id' : 31, 'name' : 'Umbreon', 'color' : "pink", 'r': 50, 'cx' : 150, 'cy' : 200},
        {'id' : 10, 'name' : 'Vaporeon', 'color' : "yellow", 'r': 50, 'cx' : 500, 'cy' : 200},
        {'id' : 19, 'name' : 'Jolteon', 'color' : "green", 'r': 50, 'cx' : 700, 'cy' : 200}
    ];

    var viz = new MC.InterestViz({
      circles: hubCircles,
      svg : d3.select('svg')
    });

    viz.createsCircles();


</r:script>

<svg>
</svg>
</body>
</html>