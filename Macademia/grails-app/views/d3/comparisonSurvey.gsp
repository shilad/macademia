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
            %{--in the following div is where the viz needs to go--}%

            <div>

                <r:script>

</r:script>


            </div>
        </td>
    </tr>
</table>

</body>

</html>

<r:script>
    </r:script>