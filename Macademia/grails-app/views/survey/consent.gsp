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

    <h1 style="top: 9mm;left:14mm;">Consent</h1>

    <p style="top: 27mm;left:14mm;">Yes,
    I do believe Consent is MAC</p>

<g:link controller="NewSurvey" action="applyConsent"
        params='[consent: true, subToken: "${subject ? subject.token : null}"]'>
    <div class="largeCircle" style="background: #f5a3d6; top:100mm;left:140mm ">
    <div class ="insideCircle" style="top: 0.5mm; left: 0.5mm;"></div></div></div>
    <p style ="position:absolute; top: 103mm;left: 153mm;">Yes, I consent</p>
</g:link>

<g:link controller="NewSurvey" action="applyConsent"
        params='[consent: false, subToken: "${subject ? subject.token : null}"]'>
    <div class="largeCircle" style="background: #b2a3f5; top:114.5mm;left:140mm; "> <div class ="insideCircle" style="top: 0.5mm; left: 0.5mm;"></div></div></div>
    <p style ="position:absolute; top: 117mm;left: 153mm;">No, I do not consent</p>
</g:link>



</div>
</body>
</html>