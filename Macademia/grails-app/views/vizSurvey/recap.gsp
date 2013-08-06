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
        <h1 style="top: 9mm;left:14mm;">Recap</h1>
        <p style="top: 27mm;left:14mm;">
            Thank you for volunteering your time and expertise!
            If you have any comments, feel free to share them in the box below!
        </p>
        <div class="textarea">
            <form id='add-person'>
                <textarea rows="10" cols="80" name="comments">  </textarea>
                <input id ="submit" class="submit" type="submit" value="Submit">
            </form>
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