<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 2:56 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html xmlns="http://www.w3.org/1999/html">
<head>
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>

  <title></title>
    <style>
    .largeCircle{
        width:83px;
        height:83px;
        border-radius:50px;
        }
    .insideCircle{
        width:73px;
        border: 1px solid #ffffff;
        height:73px;
        border-radius:50px;
        font-size:20px;
        color: #ffffff;
        line-height:100px;
        text-align:center;
        position:relative;
        top: 4px;
        left: 4px;
    }</style>
</head>


<body>
<div class="background">
<h1>Instructions</h1>
    </br>
<p style="margin-top:30px;margin-left:50px; width: 600px">Thanks for a great summer Shilad. </p>
<g:link url="vizTask">
    %{--aligns with the bottom of the text placed in the above <p>--}%
        <div id='doneButton' class="largeCircle" style="background: #f5a3d6;position: relative;float:right;bottom: 0px;right: 250px">
            <div class ="insideCircle" >

                <p  style="margin-top: 38%">Continue</p>
            </div>
        </div>
</g:link>
</body>
</html>