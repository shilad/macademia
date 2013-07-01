<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 7/1/13
  Time: 3:00 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main"/>

    <r:require modules = "darth"/>

  <title></title>
</head>
<body>
<style type="text/css">
.node circle {
    stroke:#000000   ;
    stroke-width: 1.5px;
}
.interestNode.minor {
    font: 13px Georgia;
    fill: #000000 ;
}
.interestNode.major {
    font: 16px Helvetica;
    font-weight: bold;
}
.personNode {
    font: 13px Georgia;
    fill:#000000 ;
    /*fill: #aaa;*/
}

.link {
    fill: none;
    stroke:#000000  ;
    stroke-width: 1.5px;
}

.random{
}

</style>
</body>
</html>