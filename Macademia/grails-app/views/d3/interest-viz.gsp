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
        {'id' : 34, 'type' : "person", 'name' : 'Eevee', 'color' : "pink", 'r': 50, 'cx' : 375, 'cy' : 425},
        {'id' : 31, 'type' : "person",'name' : 'Umbreon', 'color' : "black", 'r': 50, 'cx' : 375, 'cy' : 150},
        {'id' : 10, 'type' : "person",'name' : 'Jolteon', 'color' : "yellow", 'r': 50, 'cx' : 150, 'cy' : 600},
        {'id' : 19, 'type' : "person",'name' : 'Vaporeon', 'color' : "blue", 'r': 50, 'cx' : 600, 'cy' : 600}
    ];

    var viz = new MC.InterestViz({
      circles: hubCircles,
      svg : d3.select('svg')
    });

    viz.createsCircles();
    viz.createInterestLabels();
    viz.setGradients();


</r:script>

<svg>

        %{--<radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">--}%
            %{--<stop offset="0%" style="stop-color:blue;stop-opacity:0" />--}%
            %{--<stop offset="100%" style="stop-color:red;stop-opacity:1" />--}%
        %{--</radialGradient>--}%

    %{--<ellipse cx="375" cy="425" rx="65" ry="65" fill="url(#grad1)" />--}%
</svg>
</body>
</html>