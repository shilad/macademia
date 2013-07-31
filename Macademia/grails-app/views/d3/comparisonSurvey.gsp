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
svg{
    position: absolute;
}

#sortable { list-style-type: none; margin: 0; padding: 0; width: 60%; }
#sortable li { margin: 0 3px 3px 3px; padding: 0.4em; padding-left: 1.5em; font-size: 1.4em; height: 18px; }
#sortable li span { position: absolute; margin-left: -1.3em; }

#bestMatch{
    color: lawngreen;
    text-indent: 75px;
}

#worstMatch{
    color: #ff0000;
    text-indent: 75px;
}

#red, #green, #blue {
    float: left;
    clear: left;
    width: 150px;
    margin: 15px;
}

#red .ui-slider-range { background: #F8F8F8 ; }
    /*#red.ui-slider-handle { fill: red; }*/
#red .ui-slider-handle { border-color: black; }
#red.ui-widget-content .ui-state-default { background: #ff0000; }
#red.ui-widget-content { background: 	#FF9999; }
#green .ui-slider-range { background: #8ae234; }
#green .ui-widget-content { background: purple; }
#green .ui-slider-handle { border-color: #8ae234; }
#blue .ui-slider-range { background: #729fcf; }
#blue .ui-widget-content { background: purple; }
#blue .ui-slider-handle { border-color: #729fcf; }

svg{
    position: absolute;
}


</style>

<script>
    $(function() {
        $( "#sortable" ).sortable();
        $( "#sortable" ).disableSelection();
    });

    function hexFromRGB(r, g, b) {
        var hex = [
            r.toString( 16 ),
            g.toString( 16 ),
            b.toString( 16 )
        ];
        $.each( hex, function( nr, val ) {
            if ( val.length === 1 ) {
                hex[ nr ] = "0" + val;
            }
        });
        return hex.join( "" ).toUpperCase();
    }
    function refreshSwatch() {
        var red = $( "#red" ).slider( "value" ),
                green = $( "#green" ).slider( "value" ),
                blue = $( "#blue" ).slider( "value" ),
                hex = hexFromRGB( red, green, blue );
        $( "#swatch" ).css( "background-color", "#" + hex );
    }
    $(function() {
        $( "#red, #green, #blue" ).slider({
            orientation: "horizontal",
            range: "max",
            min: 1,
            max: 10,
            value: 2,
            change: refreshSwatch

//
        });
        $( "#red").slider( "value", 255 );
        $( "#green" ).slider( "value", 140 );
        $( "#blue" ).slider( "value", 60 );
    });


</script>

</head>

<body class="ui-widget-content" style="border: 0;">

<table border="1" width=100% height=100%>
    <tr>
        <td width=30%>
            <table>
                <tr>
                    <h1>Related to Donnie Burroughs</h1>
                    <table>
                        <tr>
                            <td width=10%>
                                <p> Relatedness
                                </p>

                                <div id="red"></div>
                                <div id="green"></div>
                                <div id="blue"></div>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td width =10m>First</td>

                                    </tr>
                                    <tr>
                                        <td>Second</td>
                                    </tr> <tr>
                                    <td>Third</td>
                                </tr>
                                </table>

                            </td>
                            <td>
                                next collon
                            </td>
                        </tr>

                    </table>
                    <br/>
                </tr>
                <tr>
                    <br/>

                    <h2> Best matches:</h2>
                    <br>

                    <div id = bestMatch>

                        Best Match
                    </div>

                    <ul id="sortable">

                        <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Miles Davis</li>
                        <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>John Coltrane</li>
                        <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Tony Williams</li>
                        <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Herbie Hancock</li>
                        <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Ron Carter</li>


                    </ul>
                    <div id="worstMatch">
                        Worst Match
                    </div>




                </tr>
                <tr>
                    <h3>Task description:</h3>
                    <p>Input the task description here.</p>
                    <br/>


                </tr>
            </table>
        </td>
        <td>right half
            <br>
            <br>







        </td>




    </tr>
</table>

</body>







</html>