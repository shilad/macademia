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
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>
    <title></title>
<style>

input.addButton {
    cursor: pointer;
    cursor: hand;
    background-color: #f3f4f4;
    font: 10px Georgia;
    font-weight: bold;
    color: #848484;
    border-radius: 10px;
    vertical-align: middle;
}

#sortable {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

#sortable li {
    margin: 0 3px 3px 3px;
    padding: 0.4em;
    padding-left: 1.5em;
    font-size: 1.4em;
    height: 18px;
}

#sortable li span {
    position: absolute;
    margin-left: -1.3em;
}

svg {
    position: absolute;
}

.sortable-boxes {
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

a.removeButton {
    font: 12px Georgia;
    color: #848484;
    padding: 50px 25px 50px 75px;
}

table{
    font: 17px Georgia;
    text-align: left;
}
/*tr.person {*/
    /*width:200px;*/
    /*vertical-align: middle;*/
/*}*/
/*td.person{*/
    /*width:75%;*/
    /*color: #6b6b6b;*/
/*}*/
td.interest {
    font: 17px Georgia;
    vertical-align: middle;
    color: #848484;
}





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
/*.background{*/
    /*width:60%;*/
    /*height:60%;*/
    /*border-radius:50px;*/
    /*font-size:20px;*/
    /*color: #ffffff;*/
    /*line-height:100px;*/
    /*background: whitesmoke;}*/
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
    left:9%;}

</style>
</head>

<body>
<div class= "background">
<table>
    %{--top row--}%
    <tr>
        <td>
            <h1>Please enter your interests</h1>
        </td>
    </tr>


    <tr>

        <td class="left-column">
            <form id='add-interest'>

                <input id = "textBox" type="text" placeholder="interest name here"/>
                <br/>
                <input class="addButton" type="submit" value="Add Interest" id="submitButton"/>
            </form>
            <ul id="interestList">
                <li class="sortable-boxes" name="sortable-box">
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
        <td> <br>



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

    $(document).ready(function () {
        $("#interestList").sortable();
        $("#interestList li:first").hide(); //hides all the sortable boxes
        $("#interestList li").each(function () {
//                                    console.log(this)
            $(this).find(".removeButton").click(function (e) {//id of the remove button
                $(this).parents("#interestList li").remove();       //id of the .sortable-box that is designated for removal
            });
        });

        $('#add-interest').on('submit', function(e){
            e.preventDefault();
            var newButton = $('#interestList li:first').clone(true);
            newButton.find('.name').text(input.val());
            console.log($('#interestList'));
            $('#interestList').append(newButton);
            newButton.show('fast');
            $("#textBox").val("");
        });

        $(function() {
            var availableTags = [
                "Sam",
                "Pedro",
                "Napoleon",
                "Marge",
                "Shilad",
                "Rebecca",
                "Jesse",
                "Ari",
                "Matt",
                "Ben",
                "Yulun",
                "Ken"


            ];
            $( "#textBox" ).autocomplete({
                source: availableTags,
//
                select: function(event, ui) {
                    $("#textBox").val(ui.item.value);
                    $("#add-interest").submit();

                    return false;
                }


            });



        });

        var input = $("form input:text");

    });









</script>

</body>
</html>