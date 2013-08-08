<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 7/31/13
  Time: 9:35 AM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="survey"/>
    <meta name="layout" content="main"/>

    <style>

    a.removeButton {
        font: 12px Georgia;
        color: #848484;
        padding: 50px 25px 50px 75px;
    }

    table{
        font: 17px Georgia;
        text-align: left;
    }
    tr.person {
        width:200px;
        vertical-align: middle;
    }
    td.person{
        width:75%;
        color: #6b6b6b;
    }
    td.interest {
        font: 17px Georgia;
        vertical-align: middle;
        color: #848484;
    }


    #bestMatch {
        color: lawngreen;
        text-indent: 75px;
    }

    #worstMatch {
        color: #ff0000;
        text-indent: 75px;
    }

    #pink, #purple, #blue {
        float: left;
        clear: left;
        width: 150px;
        margin: 15px;
        background-color: #d3d3d3;
    }

    #pink .ui-slider-range {
        background: #d3d3d3;
    }

    #pink .ui-slider-handle {
        background: #f5a3d6;
        border-color: #ffffff;
        border-width: 2px;
        height: 25px;
        width: 25px;
        border-radius: 25px;
        position: absolute;
        top: 50%;
        margin-top: -15px;
    }

    #purple .ui-slider-range {
        background: #d3d3d3;
    }

    #purple .ui-slider-handle {
        background: #b2a3f5;
        border-color: #ffffff;
        border-width: 2px;
        height: 25px;
        width: 25px;
        border-radius: 25px;
        position: absolute;
        top: 50%;
        margin-top: -15px;
    }

    #blue .ui-slider-range {
        background: #d3d3d3;
    }

    #blue .ui-slider-handle {
        background: #A8C4E5;
        border-color: #ffffff;
        border-width: 2px;
        height: 25px;
        width: 25px;
        border-radius: 25px;
        position: absolute;
        top: 50%;
        margin-top: -15px;
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

    .sortable-boxa {
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

    h1 {
        font: 20px Georgia;
        font-weight:bold;
        color: #848484;
    }

    p {
        font: 15px Georgia;
        color: #848484;
    }



    input.addBotton {
        cursor: pointer;
        cursor: hand;
        background-color: #f3f4f4;
        font: 10px Georgia;
        font-weight: bold;
        color: #848484;
        border-radius: 10px;
        vertical-align: middle;
    }
    </style>
    <script>

        $(function () {
            $("#pink, #purple, #blue").slider({
                orientation: "horizontal",
                range: "min",
                min: 1,
                max: 10,
                value: 2
                // change: something
            });
            $("#pink").slider("value", 4);
            $("#purple").slider("value", 2);
            $("#blue").slider("value", 6);


        });
    </script>

</head>

<body class="ui-widget-content" style="border: 0;">
<table>
    <tr>
        <td style="border: 2px solid #d3d3d3;padding: 5px;background-color: #f3f4f4; width: 25%">
            <table>
                %{--Sliders @ top of page--}%
                <tr>
                    <td class="interest">
                        <div id="pink"></div>
                    </td>
                    <td class="interest">Mathematics</td>

                </td>
                </tr>
                <tr>
                    <td class="interest">
                        <div id="purple"></div>
                    </td>

                    <td class="interest">Sustainability</td>

                </tr>
                <tr>
                    <td class="interest">
                        <div id="blue"></div>
                    </td>
                    <td class="interest">Scholarship</td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h1>Best matches:</h1>

                        <p>List people in order from <b>top to bottom</b> who best match the task described below. Drag a person listed below to reorder them.</p>
                        <br/>
                    </td>
                </tr>
                <tr>
                    %{--sortable boxes--}%
                    <td colspan="3">
                    <g:form id='peopleList'>
                        <ul id="peopleList">
                            <li class="sortable-boxa" name="sortable-box">
                                <input type="hidden" name="people" value=""/>
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
                    </g:form>
                </tr>
                <tr>
                    %{--<a class="addButton" href="#">add</a>--}%
                </tr>
                <tr>
                    <td>
                        %{--below is where the add person box should go--}%
                        <br/>
                        <form id='add-person'>

                            <input id = "textBox" type="text" placeholder="person's name here"/>
                            <br/>
                            <input class="addButton" type="submit" value="Add Person" id="submitButton"/>
                        </form>

                        <script>



                            //   var sortableBoxTemplate = "<li class='sortable-boxa' name='sortable-box'><table><tr><td class='name' width=140mm></td><td><a class='removeButton' href='#'>remove</a></td></tr></table></li>";



                            $(document).ready(function () {
                                $("#peopleList").sortable();
                                $("#peopleList li:first").hide(); //hides all the sortable boxes
                                $("#peopleList li").each(function () {
//                                    console.log(this)
                                    $(this).find(".removeButton").click(function (e) {//id of the remove button
                                        $(this).parents("#peopleList li").remove();       //id of the .sortable-box that is designated for removal
                                    });
                                });
                                $('#doneButton').on('click', function(){
                                    $('#peopleList').submit();
                                });
                                $('#add-person').on('submit', function(e){
                                    var numCurrentPeople = $('.sortable-boxa'); //the number of people currently on the page
                                    console.log(numCurrentPeople.size());

                                    if(numCurrentPeople.size() < 6 ){
                                        e.preventDefault();
                                        var newButton = $('#peopleList li:first').clone(true);
                                        newButton.find('.name').text(input.val());
                                        newButton.find('input').val(input.val());
                                        console.log($('#peopleList'));
                                        $('#peopleList').append(newButton);
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
                                    $("#add-person").submit();

                                    return false;
                                }


                            });



                            });

//                                $(function() {
//                                    $("#searchField").autocomplete({
//                                        source: "values.json",
//                                        select: function(event, ui) {
//                                            $("#searchForm").submit(); }
//                                    });
//                                });
//



                                var input = $("form input:text");

//                                $("#submitButton").click(function () {
//                                    var newButton = $('#peopleList li:first').clone(true);
//                                    newButton.find('.name').text(input.val());
//                                    console.log($('#peopleList'));
//                                    $('#peopleList').append(newButton);
////                                    newButton.appendTo($('#peopleList'));
//                                    newButton.show();
//                                });
                            });


                        </script>

                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <br/>
                        <h1>Task Description</h1>
                    </td>
                </tr>
            </table>
            <g:link url="vizTaskSave">
                <div id='doneButton' class="largeCircle" style="background: #f5a3d6; top:197mm;left:165.5mm ">
                    <div class ="insideCircle" style="top: 0.5mm; left: 0.5mm;"></div></div></div>

                <p style ="position:absolute; top: 200mm;left: 166mm;">Done</p>
            </g:link>
        </td>
        <td>
            %{--in the following div is where the viz needs to go--}%
            <div>
                <r:img dir="images" file="viz.png"></r:img>
            </div>
        </td>
    </tr>
    <td>
        %{--<FORM METHOD="LINK" ACTION="page1.htm">--}%
            %{--<INPUT TYPE="submit" VALUE="Clickable Button">--}%
        %{--</FORM>    --}%







    </td>
</table>



</body>

</html>
