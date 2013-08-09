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
        width: 260px;
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
    </style>
</head>

<body>
<div class= "background">

    <h1 >Enter your Interests</h1>

<p style="position:relative; margin-top: 40px; left:14mm;">Please enter your interests placing your most central interest at the top of the list</p>
<div class="interestAdd">
    <form id='add-interest'>
        <input style="margin-top:30px" id = "textBox" type="text" placeholder="interest name here"/>
        <input style="margin-top:30px" class="addButton" type="submit" value="Add Interest" id="submitButton"/>
    </form>
    <g:form url="interestSave" id="interestListForm">
        <ul id="interestList">
            <li class="sortable-boxes" name="sortable-box">
                <input type="hidden" name="interest" value=""/>
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
        </div>
        <input style="position:absolute; bottom: 44px; right:44px" type="submit" value="Submit" id="submitButton"/>
    </g:form>
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

        $('#interestListForm').on('submit', function(e){
            var currentInterests = $('.sortable-boxes');
            if(currentInterests.size()==1){
                alert("Enter at least one interest");
                e.preventDefault();
            }
        });

        $('#add-interest').on('submit', function(e){

            var currentInterests = $('.sortable-boxes');
            e.preventDefault();



            if(currentInterests.size() < 9 && input.val()!=""){

                var newButton = $('#interestList li:first').clone(true);
                newButton.find('.name').text(input.val());
                newButton.find('input').val(input.val());
                console.log($('#interestList'));
                $('#interestList').append(newButton);
                newButton.show('fast');
                $("#textBox").val("");
            }



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