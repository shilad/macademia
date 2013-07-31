<%--
  Created by IntelliJ IDEA.
  User: zixiao
  Date: 7/31/13
  Time: 10:59 AM
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

.active {
    fill: black;
}

.activeInterest{
    /*
    This should have the same css style as interest except we are using
    a different fill
    */
    font: 13px Georgia;
    fill: black;
}

.interest{
    font: 13px Georgia;
    fill: #C0C0C0;
}
</style>

<r:script>
    var viz = new MC.MainViz({
//        hubs: hubs,
//        root: root,
//        interests: interests,
//        people: peeps,
//        svg : svg,
//        colors: colors,
//        relatednessMap:relatednessMap
    });

    //    var viz = new MC.MainViz({
    //        hubs: hubs,
    //        root: root,
    //        interests: interests,
    //        people: peeps,
    //        svg : svg,
    //        colors: colors,
    //        relatednessMap:relatednessMap
    //    });


</r:script>

<svg>
</svg>

</body>
</html>