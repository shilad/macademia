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


    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    context.rect(0, 0, canvas.width, canvas.height);

    // create radial gradient
    var grd = context.createRadialGradient(238, 50, 10, 238, 50, 300);
    // light blue
    grd.addColorStop(0, '#8ED6FF');
    // dark blue
    grd.addColorStop(1, '#004CB3');

    context.fillStyle = grd;
    context.fill();+



</r:script>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style="stop-color:rgb(255,255,255);
            stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
        </radialGradient>
    </defs>
    <ellipse cx="200" cy="70" rx="85" ry="55" fill="url(#grad1)" />
</svg>
</body>
</html>