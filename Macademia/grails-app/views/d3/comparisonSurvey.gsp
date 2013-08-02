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

    .removeButton {
        font-size: 12;
        margin-right: 5mm;
    }

    #bestMatch {
        color: lawngreen;
        text-indent: 75px;
    }

    #worstMatch {
        color: #ff0000;
        text-indent: 75px;
    }

    #pink, #green, #blue {
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

    #green .ui-slider-range {
        background: #d3d3d3;
    }

    #green .ui-slider-handle {
        background: #b4f5a3;
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
        height: 7mm;
        background-color: #dcdcdc;
        border: 1px solid black;
        display: block;
    }

    </style>

    <script>

        $(function () {
            $("#pink, #green, #blue").slider({
                orientation: "horizontal",
                range: "min",
                min: 1,
                max: 10,
                value: 2
                // change: something
            });
            $("#pink").slider("value", 4);
            $("#green").slider("value", 2);
            $("#blue").slider("value", 6);


        });
    </script>

</head>

<body class="ui-widget-content" style="border: 0;">

<table>
    <tr>
        <td>
            <table>
                %{--Sliders @ top of page--}%
                <tr>
                    <td>
                        <div id="pink"></div>
                    </td>
                    <td width=8m>First</td>

                </td>
                </tr>
                <tr>
                    <td>
                        <div id="green"></div>
                    </td>

                    <td width=8m>Second</td>

                </tr>
                <tr>
                    <td>
                        <div id="blue"></div>
                    </td>
                    <td width=8m>Third</td>
                </tr>
                <tr>
                    <td colspan="3" width=10m>
                        <h1>Best matches:</h1>

                        <p>List people who best match the task described below. Drag a person listed below to reorder them.</p>
                    </td>
                </tr>
                <tr>
                    %{--sortable boxes--}%
                    <td colspan="3">

                        <ul id="peopleList">
                            <li class="sortable-boxa" name="sortable-box">
                                %{--this table is for aligning the words in the sortable box--}%
                                <table>
                                    <tr>
                                        <td id="name" width=140mm>

                                        </td>
                                        <td id= "orange">
                                            <a class="removeButton" href="#">remove</a>
                                        </td>
                                    </tr>
                                </table>
                            </li>
                        </ul>

                    </td>
                </tr>
                <tr>
                    %{--<a class="addButton" href="#">add</a>--}%
                </tr>
                <tr>
                    <td>
                        %{--below is where the add person box should go--}%
                        <form>

                            <input class="addButton" type="submit" value="Add Person" id="submitButton"/>
                            <input type="text"/>

                        </form>

                        <div id="testing"></div>

                        <script>
                            var i=0;
                            var makeButton = function(){

                                var newButton = $('#peopleList li:first').clone(true);
                                newButton.find('#name').text(input.val());
                                newButton.find('a').attr("id", i+'remove');
                                newButton.attr("id", i+"name");

//                                console.log(i);
                                i++;
                                return newButton;
                            }

                            $(function () {

                                $("#peopleList").sortable();
                            });


                            $(document).ready(function () {
                                $("#peopleList li:first").hide();   //hides all the sortable boxes
                                $("#peopleList li").each(function () {
                                    console.log()


                                });
                            });

                            $('#'+i+'remove').click(function () {//id of the remove button
                                $('#'+i+'name').remove();       //id of the .sortable-box that is designated for removal
                            });


                            var input = $("form input:text");

                            $("#submitButton").click(function () {
                                var button = makeButton();
                                button.appendTo($('#peopleList'));
                                button.show();
                            });
                       </script>

                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h2>Task Description</h2>
                    </td>
                </tr>
            </table>
        </td>
        <td>
            %{--in the following div is where the viz needs to go--}%
            <div>

                viz here
            </div>
        </td>
    </tr>
</table>

</body>

</html>

