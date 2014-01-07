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




<div id='mainSvg'>
<svg>
</svg>
</div>

</body>
</html>
<r:script>
    var viz = new MC.MainViz({
        height:769,
        width: 1024
    });

</r:script>