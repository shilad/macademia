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

    %{--<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />--}%
    %{--<script src="http://code.jquery.com/jquery-1.9.1.js"></script>--}%
    %{--<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>--}%
    %{--<link rel="stylesheet" href="/resources/demos/style.css" />--}%

    <style>

    #bestMatch {
        color: lawngreen;
        text-indent: 75px;
    }

    #worstMatch {
        color: #ff0000;
        text-indent: 75px;
    }

    #red, #green, #blue {
        float: left;
        clear: left;
        width: 150px;
        margin: 15px;
    }

    #red .ui-slider-range {
        background: #F8F8F8;
    }

        /*#red.ui-slider-handle { fill: red; }*/
    #red .ui-slider-handle {
        border-color: black;
    }

    #red.ui-widget-content .ui-state-default {
        background: #ff0000;
    }

    #red.ui-widget-content {
        background: #FF9999;
    }

    #green .ui-slider-range {
        background: #8ae234;
    }

    #green .ui-widget-content {
        background: purple;
    }

    #green .ui-slider-handle {
        border-color: #8ae234;
    }

    #blue .ui-slider-range {
        background: #729fcf;
    }

    #blue .ui-widget-content {
        background: purple;
    }

    #blue .ui-slider-handle {
        border-color: #729fcf;
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

        function hexFromRGB(r, g, b) {
            var hex = [
                r.toString(16),
                g.toString(16),
                b.toString(16)
            ];
            $.each(hex, function (nr, val) {
                if (val.length === 1) {
                    hex[ nr ] = "0" + val;
                }
            });
            return hex.join("").toUpperCase();
        }
        function refreshSwatch() {
            var red = $("#red").slider("value"),
                    green = $("#green").slider("value"),
                    blue = $("#blue").slider("value"),
                    hex = hexFromRGB(red, green, blue);
            $("#swatch").css("background-color", "#" + hex);
        }
        $(function () {
            $("#red, #green, #blue").slider({
                orientation: "horizontal",
                range: "max",
                min: 1,
                max: 10,
                value: 2,
                change: refreshSwatch

//
            });
            $("#red").slider("value", 255);
            $("#green").slider("value", 140);
            $("#blue").slider("value", 60);
        });

        $(function () {
            $("#sortable").sortable();
            $("#sortable").disableSelection();
//            $("#sortable").sortable("destroy");
        });
    </script>

</head>

<body class="ui-widget-content" style="border: 0;">

<table>
    <tr>
        <td>
            <table>
                <tr>
                    <td>
                        <div id="red"></div>
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
                    <td colspan="3">

                        <ul id="sortable" name="peopleList">
                            <span><li class="ui-state-default">Miles Davis</li></span>
                            <span><li class="ui-state-default">John Coltrane</li></span>
                            <span><li class="ui-state-default">Tony Williams</li></span>
                            <span><li class="ui-state-default">Herbie Hancock</li></span>
                            <span><li class="ui-state-default">Ron Carter</li></span>
                        </ul>

                    </td>
                </tr>
                <tr>
                    <td>
                        <g:form action="save" name="personName" id="personName" method="post">
                            <br/>

                            <div>Add a person
                                <input type="text" name="nameInput" maxlength="100">
                            </div>
                            <br/>
                        </g:form>
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
            <div>

                HIESEFASDF

            </div>
        </td>
    </tr>
</table>

</body>

</html>

<r:script>
    </r:script>