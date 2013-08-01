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
    <r:require modules="d3js"/>
    %{--<meta name="layout" content="main"/>--}%

    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
    <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    <link rel="stylesheet" href="/resources/demos/style.css" />

    <style>

    #bestMatch {
        color: lawngreen;
        text-align: center;
        font-size: 20;
    }

    #worstMatch {
        color: #ff0000;
        text-align: center;
        font-size: 20;
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

    #green .ui-slider-range {background: #8ae234;}

    #green .ui-widget-content {background: purple;}

    #green .ui-slider-handle {border-color: #8ae234;
    }

    #blue .ui-slider-range {background: #729fcf;
    }

    #blue .ui-widget-content {background: purple;
    }

    #blue .ui-slider-handle {border-color: #729fcf;}

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
        });

    </script>

</head>

<body class="ui-widget-content" style="border: 0;">
<table width=100%>
    <tr>
        <td width=33%>
            <h1>Related to Donnie Burroughs</h1>
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
                         <div id="bestMatch">Best Match</div>
                         <ul id="sortable">
                             <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Miles Davis</li>
                             <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>John Coltrane</li>
                             <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Tony Williams</li>
                             <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Herbie Hancock</li>
                             <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Ron Carter</li>
                         </ul>
                         <div id ="worstMatch">Worst Match</div>
                     </td>
                 </tr>
                 <tr>
                     <td>
                         <div> Add a person    <input type="text" name="interest_inputs" maxlength="100">
                             </div>
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
                <p>
                    This will be the viz
                </p>
            </div>
        </td>
    </tr>
</table>


</body>

</html>