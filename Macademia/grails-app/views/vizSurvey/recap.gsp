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

<div>
    <h1 style="position:absolute; margin-left: 50px; margin-top: 20px;">Recap</h1>

    %{--<div class="textarea">--}%
    %{--<form id='add-person'>--}%
    %{--<textarea rows="10" cols="80" name="comments">  </textarea>--}%
    %{--<input id ="submit" class="submit" type="submit" value="Submit">--}%
    %{--</form>--}%
    %{--</div>--}%

</div>

<div>
<table style="position:absolute;margin-top: 100px; margin-left:50px">
<tr><td colspan="4 " style="height: 30px" ><h5 >How well do these people relate to the task?</h5></td></tr>

<g:form params="${[people: people]}" id="recap-form" url="thankYou">
    <g:each status="i" in="${people}" var="q">
        <tr>
            <td style="width: 105px">${q}</td>
            <td>
                <div class="radio-buttons">
                    <table>
                        <tr>
                            <td style="width: 42.5px">
                            </td>
                            <td style="width: 95px">
                                <input type="radio" name="${"radio_"+ q}" value="1"/>
                            </td>
                            <td style="width: 95px">
                                <input type="radio" name="${"radio_"+q}" value="2"/>
                            </td>
                            <td style="width: 95px">
                                <input type="radio" name="${"radio_"+q}" value="3"/>
                            </td>
                            <td style="width: 95px">
                                <input type="radio" name="${"radio_"+q}" value="4"/>
                            </td>
                            <td style="width: 95px">
                               <input type="radio" name="${"radio_"+q}" value="5"/>
                            </td>
                        </tr>
                    </table>
                </div>
        </tr>
    %{--labels for the radio buttons--}%
        <tr style="position:relative; margin-top: 33px; margin-left:140px">
            <td></td>
            <td>
                <table><tr>
                    <td style="width:12px"></td>
                    <td style="width:114px">Strongly Agree</td>
                    <td style="width:83px">Agree</td>
                    <td style="width:86px">Neutral</td>
                    <td style="width:86px">Disagree</td>
                    <td style="width:84px">Strongly Disagree</td>
                </tr></table>
            </td>
        </tr>
        </g:each>


<tr>
    <td colspan="4" style="height: 30px"> <h5>Was the visualization visually appealing? </h5>
    </td>
</tr>
<tr style="height: 25px">
    <td style="width: 105px">

    </td>
    <td>
        <div class="radio-buttons">
            <table>
                <tr>
                    <td style="width: 42.5px">
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Appealing" value="1"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Appealing" value="2"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Appealing" value="3"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Appealing" value="4"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Appealing" value="5"/>
                    </td>
                </tr>
            </table>
        </div>
</tr>

%{--labels for the radio buttons--}%
<tr style="position:relative; margin-top: 33px; margin-left:140px">
    <td>

    </td>
    <td>
        <table>
            <tr>
                <td style="width:12px"></td>
                <td style="width:114px">Strongly Agree</td>
                <td style="width:83px">Agree</td>
                <td style="width:86px">Neutral</td>
                <td style="width:86px">Disagree</td>
                <td style="width:84px">Strongly Disagree</td>
            </tr>
        </table>
    </td>
</tr>
<div id="radiobar-label">
<tr >


    <td colspan="4" style="height: 30px"> <h5>Was this visualization effective?</h5></td>
</tr>
<tr style="height: 25px">
    <td style="width: 105px">

    </td>
    <td>
        <div class="radio-buttons">
            <table>
                <tr>
                    <td style="width: 42.5px">
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Effective" value="1"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Effective" value="2"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Effective" value="3"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Effective" value="4"/>
                    </td>
                    <td style="width: 95px">
                        <input type="radio" name="radio_Effective" value="5"/>
                    </td>
                </tr>
            </table>
        </div>
</tr>
</g:form>

    %{--labels for the radio buttons--}%
<tr style="position:relative; margin-top: 33px; margin-left:140px">
    <td>

    </td>
    <td>
        <table>
            <tr>
                <td style="width:12px"></td>
                <td style="width:114px">Strongly Agree</td>
                <td style="width:83px">Agree</td>
                <td style="width:86px">Neutral</td>
                <td style="width:86px">Disagree</td>
                <td style="width:84px">Strongly Disagree</td>
            </tr>
        </table>
    </td>
</tr>
    </div>
</table>
</div>
  <div name="submit" >

    <input style="position:relative; margin-left:630px; margin-top: 500px" type="submit" value="Submit" id="submitButton"/>
   </div>
</div>
<script>

    var input = $("form textarea:text");
    $(document).ready(function () {


        $('#submit').click(function () {

            var text = $('textarea.rounded-corners').val();
            console.log(text);


            //send to server and process response
        });

        $('#submitButton').on('click', function(){
            alert("hi");
            $('#recap-form').submit();
        });


       // use the dataModle to loop through and

//            $('#add-person').on('submit', function(e){
//                e.preventDefault();

//            });
    });
</script>
</div>

</body>
</html>