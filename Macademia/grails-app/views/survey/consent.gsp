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

    <h1 style="position: absolute;top: 2mm;left:11mm">Consent</h1>

    <p style="position: absolute;top: 20mm;left:20mm">Yes,
    I do believe Consent is MAC</p>

    <div class="largeCircle" style="background: #b2a3f5; top:103mm;
    left:106mm "> <div class ="insideCircle"></div></div></div>
<p style ="position:absolute; top: 101mm;left: 118mm;">Yes, I consent</p>

<g:link controller="NewSurvey" action="applyConsent"
        params='[consent: true, subToken: "${subject ? subject.token : null}"]'>
    <div class="largeCircle" style="background: #b2a3f5; top:103mm; left:106mm ">
    <div class ="insideCircle"></div></div></div>
    <p style ="position:absolute; top: 101mm;left: 118mm;">Yes, I consent</p>
</g:link>

<g:link controller="NewSurvey" action="applyConsent"
        params='[consent: true, subToken: "${subject ? subject.token : null}"]'>
    <div class="largeCircle" style="background: greenyellow; top:118mm;
    left:106mm; "> <div class ="insideCircle"></div></div></div>
<p style ="position:absolute; top: 117mm;left: 118mm;">No, I do not consent</p>
</g:link>



</div>
</body>
</html>