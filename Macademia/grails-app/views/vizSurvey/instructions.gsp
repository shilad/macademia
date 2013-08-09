<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 2:56 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>

  <title></title>
    <style>
    .largeCircle{
        width:83px;
        height:83px;
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
        top: 1mm;
        left: 1mm;
    }</style>
</head>


<body>
<div class="background">
<h1 style="top: 9mm;left:14mm;">Instructions</h1>
<p style="top: 27mm;left:14mm;">Pete Bitzer and his wife Penelope
really did exist, much to little Sally's surprise. They had a light blue mail box and lived on Dreary Lane, sure,
but it was all a front put up by the government to avoid taxes.</p>
<g:link url="vizTask">
        <div id='doneButton' class="largeCircle" style="background: #f5a3d6;position: relative;float:right;top: 424px;right: 30px">
            <div class ="insideCircle" >

                <p  style="  margin-top: 22px;">Continue</p>
            </div>
        </div>
</g:link>
</body>
</html>