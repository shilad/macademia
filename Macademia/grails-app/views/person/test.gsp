<%--
  Created by IntelliJ IDEA.
  User: zixiao
  Date: 7/1/13
  Time: 4:42 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="core"/>
    <meta name="layout" content="main"/>
</head>
<body>

<a href="#/?test1=test1&test2=test2">Link 1</a> <br/>
<a href="#/?test3=test3&test4=test4">Link 2</a> <br/>
<a href="#/?test5=test5&test6=test6">Link 3</a> <br/>
<a href="#/?test7=test7&test8=test8">Link 4</a> <br/>
<br/>
This is our testing page

</body>
</html>

<r:script>

    $( document ).ready(function() {
//        macademia.history.update();



        $("a").on("click", function(event){
            macademia.history.update(event);
            macademia.history.getOld(1);
//        macademia.history.get('test2');
        });

    });
</r:script>