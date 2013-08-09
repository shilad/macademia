<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 3:22 PM
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
        width:50px;
        height:50px;
        border-radius:50px;
        /*//position:absolute;*/
    }
    .insideCircle{
        width:44px;
        border: 1px solid #ffffff;
        height:44px;
        border-radius:50px;
        font-size:20px;
        color: #ffffff;
        line-height:100px;
        text-align:center;
        position:relative;
        top:2px;
        left: 2px;

    }
        </style>
</head>

<body>
<div class = "background">

    <h1>Consent</h1>
     </br>
    <p style="margin-top:30px;margin-left:50px; width: 600px">Consent is Mac </p>

    %{--<p style=" position: relative; top: 27mm;left:14px;">Yes, I do believe Consent is MAC</p>--}%

<g:link url="consentSave" params='[consent: true]'>
    <div class="largeCircle" style="background: #f5a3d6; bottom: 90px;  position: absolute; left: 650px">
    <div class ="insideCircle" ></div>
    <p style ="position:absolute; top: 14px;left: 55px; width: 300">Yes, I consent</p>
    </div>
    %{--<div style ="position: absolute; top:-100; left: 1025px">Yes, I consent </div>--}%
</g:link>

<g:link url="complete">
    <div class="largeCircle" style="background: #b2a3f5; bottom:30px;  position: absolute; left: 650px">
        <div class ="insideCircle" ></div>
        <p style ="position:relative; top: -31px;left: 55px; width: 300">No, I do not consent</p>

    </div>
</g:link>



</div>
</body>
</html>