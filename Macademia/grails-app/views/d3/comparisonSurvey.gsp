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
    font: 12px Georgia;
    color: #d3d3d3;
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

.sortable-boxes {
    
    height: 18px;
    display: block;
    padding: 5px 5px;
    border-radius: 10px;
    background-color: #f3f4f4;
    border: 1px solid #d3d3d3;
    display: block;
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

                        <p>List people who best match the task described below. Drag a person listed below to reorder them.</p>
                        <br/>
                    </td>
                </tr>
                <tr>
                    %{--sortable boxes--}%
                    <td colspan="3">

                        <ul id="peopleList">
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
                <tr>
                    %{--<a class="addButton" href="#">add</a>--}%
                </tr>
                <tr>
                    <td>
                        %{--below is where the add person box should go--}%
                        <br>
                        <form  onsubmit="onSubmit()">

                            <input class="addButton" type="submit" value="Add Person" id="submitButton"/>
                            <br>
                            <br>
                            <input id = "textBox" type="text" placeholder="person name here"/>

                        </form>



                        <script>

                            function onSubmit(){
                                $("#textBox").val("");

                            }

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
                                   "Ken",
                                   "your momma"

                                ];
                                $( "#textBox" ).autocomplete({
                                    source: availableTags
                                });
                            });


                            var makeButton = function(){

                                var newButton = $('#peopleList li:first').clone(true);
                                newButton.find('.name').text(input.val());
                                return newButton;
                            }

                            $(function () {

                                $("#peopleList").sortable();
                            });


                            $(document).ready(function () {
                                $("#peopleList li:first").hide();   //hides all the sortable boxes
                                $("#peopleList li").each(function () {
                                    console.log(this)
                                  $(this).find(".removeButton").click(function (e) {//id of the remove button
                                        $(this).parents("#peopleList li").remove();       //id of the .sortable-box that is designated for removal

                                  });


                                });

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
                        <br/>
                        <h1>Task Description</h1>
                    </td>
                </tr>
            </table>
        </td>
        <td>
            %{--in the following div is where the viz needs to go--}%
            %{--in the following div is where the viz needs to go--}%
            <div>
                <r:img dir="images" file="viz.png"></r:img>
            </div>
        </td>
    </tr>
</table>

</body>

</html>

