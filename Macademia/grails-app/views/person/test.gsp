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

<div style="margin-left:300px;margin-right:auto;margin-top:100px;">
    <table>
        <tr><td><a href="#/?test1=test1&test2=test2">Link 1</a>
    </td>
        <td><a href="#/?test3=test3&test4=test4">Link 2</a>
    </td>
        <td><a href="#/?test5=test5&test6=test6">Link 3</a>
    </td>
        <td><a href="#/?test7=test7&test8=test8">Link 4</a>
    </td>
    </tr><tr>
        <td><button id="#b2">Go back two</button></td>
        <td><button id="#b1">Go back one</button></td>
        <td><button id="#f1">Go forward one</button></td>
        <td><button id="#f2">Go forward two</button></td>
    </tr>
    </table>
    This is our testing page

</div>
<br/>

</body>
</html>

<r:script>

    $( document ).ready(function() {
        $("button").on("click", function(e){
           var id=$(this).context.id;
           if(id.indexOf("b")>=0){
               if(id.indexOf(1)>=0){
                   History.back();
               }
               else{
                   History.go(-2);
               }
           }
           else{
               if(id.indexOf(1)>=0){
                   History.forward();
               }
               else{
                   History.go(2);
               }
           }
        });
        console.log(macademia.history.getOld(0));
        macademia.history.bindAnchors($("a"));


//        macademia.history.update();
//        $("a").on("click", function(event){
//            macademia.history.update(event);
////            macademia.history.getOld(1);
////        macademia.history.get('test2');
//        });

    });
</r:script>