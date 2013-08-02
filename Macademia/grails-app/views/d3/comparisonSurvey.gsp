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
        position:absolute;
        top:50%;
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
        position:absolute;
        top:50%;
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
        position:absolute;
        top:50%;
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

    span {
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

        $(function () {
            $("#sortable").sortable();
//            $("#sortable").disableSelection();
//            $("#sortable").sortable("destroy");
        });

        $(document).ready(function () {
            $(".sortable-box").hide();   //hides all the sortable boxes
            $(".sortable-box").each(function(){
                $(this).click(function (e) {//id of the remove button
                    $(this).remove();       //id of the .sortable-box that is designated for removal
                });});


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
                    <p> List people who best match the task described below. Drag a person listed below to reorder them.</p>
                    </td>
                </tr>
                <tr>
                    %{--sortable boxes--}%
                    <td colspan="3">

                        <ul id="sortable" name="peopleList">

                            <span id = firstName class = "sortable-box" ><li>
                                %{--this table is for aligning the words in the sortable box--}%
                                <table>
                                    <tr >
                                        <td id="name" width=140mm>
                                            %{--name of person goes here--}%


                                        </td>
                                        <td>
                                            <a class="removeButton" href="#">remove</a>
                                        </td>
                                    </tr>
                                </table>
                            </li></span>
                            %{--<span class = "sortable-box" id ="2"><li>--}%
                                %{--<table>--}%
                                    %{--<tr>--}%
                                        %{--<td width=140mm>--}%
                                            %{--Ron Carter--}%
                                        %{--</td>--}%
                                        %{--<td>--}%
                                            %{--<a class="removeButton" href="#" id ="2">remove</a>--}%
                                        %{--</td>--}%
                                    %{--</tr>--}%
                                %{--</table>--}%
                            %{--</li></span>--}%
                            %{--<span class = "sortable-box" id ="3"><li>--}%
                            %{--<table>--}%
                                %{--<tr>--}%
                                    %{--<td width=140mm>--}%
                                        %{--Herbie Hancock</td>--}%
                                    %{--<td>--}%
                                        %{--<a class="removeButton" href="#" id ="3">remove</a>--}%
                                    %{--</td>--}%
                                %{--</tr>--}%
                            %{--</table>--}%
                        %{--</li></span>--}%
                            %{--<span class = "sortable-box" id ="4"><li>--}%
                            %{--<table>--}%
                                %{--<tr>--}%
                                    %{--<td width=140mm>--}%
                                        %{--Tony Williams--}%
                                    %{--</td>--}%
                                    %{--<td>--}%
                                        %{--<a class="removeButton" href="#" id ="4">remove</a>--}%
                                    %{--</td>--}%
                                %{--</tr>--}%
                            %{--</table>--}%
                        %{--</li></span>--}%

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

                            <input class = "addButton" type="submit" value="Add Person" id = "submitButton" />
                            <input type="text" value='type person name here'/>

                        </form>

                        <div id = "testing"> </div>

                        <script>

                            var makeButton = function(){
                                var newButton = document.getElementById("firstName").cloneNode(true);







                                return newButton;


                            }



                            var input = $("form input:text");

//                            this function needs to append a button to the ul, #sortable

                            $( "#submitButton").click(function() {  //this function needs to append a button to the DOM,

                                $("#name").append(input.val());
                                $("#sortable").append(input.val());
                                $(".sortable-box").toggle();


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

<r:script>
    </r:script>