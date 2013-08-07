<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 3:22 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>
  <title></title>
</head>

<body>
<div class = "background">

    <h1 style=" position:relative;top: 9mm;left:14mm;">Consent</h1>

    <p style=" position: relative; top: 27mm;left:14px;">Yes, I do believe Consent is MAC</p>

<g:link url="consentSave" params='[consent: true, email: params.email]'>
    <div class="largeCircle" style="background: #f5a3d6; top:97mm;  position: absolute; left: 650px">
    <div class ="insideCircle" style="top: 0.5mm; left: 0.5mm;"></div>
    <p style ="position:absolute; top: 9px;left: 43px;">Yes, I consent</p>
    </div>
    %{--<div style ="position: absolute; top:-100; left: 1025px">Yes, I consent </div>--}%
</g:link>

<g:link url="consentSave" params='[consent: true, email: params.email]'>
    <div class="largeCircle" style="background: #b2a3f5; top:114.5mm;  position: absolute; left: 650px">
        <div class ="insideCircle" ></div>
        <p style ="position:relative; top: 9px;left: 43px;">No, I do not consent</p>

    </div>
</g:link>



</div>
</body>
</html>