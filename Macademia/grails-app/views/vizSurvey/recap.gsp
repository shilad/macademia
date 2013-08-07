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
<body>
<div class = "background">

    <div>
        <h1 style ="position:absolute; margin-left: 50px; margin-top: 20px;">Recap</h1>

        %{--<div class="textarea">--}%
            %{--<form id='add-person'>--}%
                %{--<textarea rows="10" cols="80" name="comments">  </textarea>--}%
                %{--<input id ="submit" class="submit" type="submit" value="Submit">--}%
            %{--</form>--}%
        %{--</div>--}%

    </div>
        <div>
            <table >
                <tr><p style= "position: relative; margin-left: 118px">Please write question here</p></tr>
              <tr >
                  <td>orange</td>
                    <td>
                        <div class="radio-buttons">
                            <table>
                                <tr>
                                    <td>
                                        <label>0 <input type="radio" name="radioButtons" value="1"
                                                        /></label>
                                    </td>
                                    <td>
                                        <label>1 <input type="radio" name="radioButtons" value="2"
                                                        /></label>
                                    </td>
                                    <td>
                                        <label>2 <input type="radio" name="radioButtons" value="3"
                                                        /></label>
                                    </td>
                                    <td>
                                        <label>3 <input type="radio" name ="radioButtons" value="4"
                                                        /></label>
                                    </td>
                                    <td>
                                        <label>4 <input type="radio" name="radioButtons" value="5"
                                                        /></label>
                                    </td>
                                </tr>
                            </table>
                        </div>
             </tr>
                %{--labels for the radio buttons--}%
                <tr style="position:absolute; margin-top: 33px; margin-left:140px">
                    <td style="width:114px">Strongly Agree</td>
                    <td style="width:76px">Agree</td>
                    <td style="width:86px">Neutral</td>
                    <td style="width:78px">Disagree</td>
                    <td style="width:84px">Strongly Disagree</td>
                </tr>
            </table>
        </div>
    </div>
    <script>
        var input = $("form textarea:text");
        $(document).ready(function () {

            $('#submit').click(function() {

                var text = $('textarea.rounded-corners').val();
                console.log(text);

                //send to server and process response
            });

//            $('#add-person').on('submit', function(e){
//                e.preventDefault();

//            });
        });
    </script>
</div>

</body>
</html>