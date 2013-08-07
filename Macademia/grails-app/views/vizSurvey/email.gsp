<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/7/13
  Time: 10:46 AM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Survey Invite</title>
    <meta name="layout" content="main"/>
    <r:require modules="core" />
    <style type="text/css">

    p.margin
    {
        margin: 60px 20px 0px 95px;
    }

    #main-container{
        height: 500px;
    }

    </style>


</head>
<body>
<div class= "rounded-corners" id="main-container">
    <br>
    <h1>Survey</h1>
    <br><br><br><br>
    <p class= "margin"><a href="${baseUrl}?email=${email}">Click here for survey</a></p>

</div>
</body>
</html>