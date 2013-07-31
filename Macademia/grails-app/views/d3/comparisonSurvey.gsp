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
    %{--<meta name="layout" content="main"/>--}%

    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
    <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    <link rel="stylesheet" href="/resources/demos/style.css" />


</head>
<body>
<style>
    svg{
        position: absolute;
        }
    #layout{

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
        text-indent: 65px;
    }








</style>

<table border="1" width=100% height=100%>
    <tr>
        <td width=30%>
            <table>
                <tr style="vertical-align: top">


                        <h1>Related to Donnie Burroughs</h1>



                   <br/>
                </tr>
                <tr>

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
        <td style="vertical-align: top">right half
            <br>
            <br>







        </td>




    </tr>
</table>

</body>

<script>
    $(function() {
        $( "#sortable" ).sortable();
        $( "#sortable" ).disableSelection();
    });
</script>





</html>