<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/5/13
  Time: 1:49 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title></title>
</head>
<style>
.interest-box {
    height: 30px;
    display: block;
    padding: 5px 5px;
    border-radius: 10px;
    background-color: #d3d3d3;
    color: #f3f4f4;
    border: 1px solid #848484;
    display: block;
    vertical-align: middle;
}
.background{
    width:60%;
    height:60%;
    border-radius:50px;
    font-size:20px;
    color: #ffffff;
    line-height:100px;
    background: whitesmoke;}
.largeCircle{
    width:100px;
    height:100px;
    border-radius:50px;
    background: #f5a3d6;
    position:absolute;
    top:46%;
    left:51%}
.insideCircle{
    width:80px;
    border: 2px solid #ffffff;
    height:80px;
    border-radius:50px;
    font-size:20px;
    color: #ffffff;
    line-height:100px;
    text-align:center;
    position:absolute;
    top:9%;
    left:9%;
}

</style>

<body>
<div class= "background">
<table>
    %{--top row--}%
    <tr>
        <td>
            <h1>Please enter your interests</h1>
        </td>
    </tr>
    %{--table for added interests--}%
    <tr>
        <td class="left-column">
            <ul>
                <li class="interest-box">
                    %{--this table is for aligning the words in the sortable box--}%
                    <table>
                        <tr>
                            <td class="name" width=140mm>

                            </td>
                            <td>
                                <a class="removeButton" href="#">remove</a>
                            </td>
                        </tr>
                    </table>
                </li>
            </ul>
        </td>
        <td class="right-column">
            <ul >
                <li class="interest-box">
                    %{--this table is for aligning the words in the sortable box--}%
                    <table>
                        <tr>
                            <td class="name" width=140mm>

                            </td>
                            <td>
                                <a class="removeButton" href="#">remove</a>
                            </td>
                        </tr>
                    </table>
                </li>
            </ul>
        </td>
    </tr>
    %{--button to move forward bottom right corner--}%
    <tr>
        <td> one
        </td>
        <td>    two
        </td>
    <td>
        <div class="largeCircle" > <div class ="insideCircle">Hello</div></div>
        %{--<div class="insideCircle">Hello</div>--}%

    </td>
</tr>
</table>
</div>
<script>

</script>

</body>
</html>