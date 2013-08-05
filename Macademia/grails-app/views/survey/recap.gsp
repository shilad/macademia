<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 2:59 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>
  <title></title>
</head>
<style>

.background{
    width:200mm;
    height:130mm;
    border-radius:50px;
    font-size:20px;
    background: whitesmoke;}

    </style>
<body>
<div class = "background">
    <div>
        <h2>Recap</h2>
        <form id='add-person'>
        Do you have any comments about this survey or your responses?
        <input class ="fed" id = "textBox" type="text" value="tsfg">
        <input type="submit" value="Submit">
        </form>
    </div>
    <script>
        var input = $("form input:text");
        $(document).ready(function () {
            $('#add-person').on('submit', function(e){
                e.preventDefault();
            console.log(input.val());
            });
        });
    </script>
</div>

</body>
</html>