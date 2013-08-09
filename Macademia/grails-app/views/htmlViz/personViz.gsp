<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <r:require modules="htmlViz"/>
    <meta name="layout" content="main"/>
    <title></title>

</head>
<body>

<r:script>
    $.ready(function(){
        var viz = new MC.HtmlViz({});

        $(function () {
            $("#pink, #purple, #blue, #green, #orange").slider({
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
            $("#green").slider("value", 8);
            $("#orange").slider("value", 5);
        });
    });

    var colors =[
        "#b4f5a3",  //green
        "#b2a3f5",  //purple
        "#a8c4e5",  //blue
        "#f5a3d6"   //pink
    ];

    var circles = [
        "${resource(dir:'images/hviz-images',file:'green-icon.png')}",
        "${resource(dir:'images/hviz-images',file:'purple-icon.png')}",
        "${resource(dir:'images/hviz-images',file:'blue-icon.png')}",
        "${resource(dir:'images/hviz-images',file:'pink-icon.png')}"
    ]

    var hubsToColors =  {};
    var hubs = ${clusterMap.keySet()};

    for(var i=0; i<hubs.length; i++){
        hubsToColors[hubs[i]] = colors[i];
    }

    for(var h in hubs){
        $(".hub_"+hubs[h]).css("background-color",hubsToColors[hubs[h]]);
    }

    for(var h in hubs){
        var c = circles[h];
        console.log(c);
        var img = $("img.h_"+hubs[h]).attr("src",c);
    }


%{--var interests = {};--}%
%{--for(var p in ${people.values()}){--}%
%{--if($(p.id).toString.equals((params.nodeID).substring(2))){--}%
%{--interests = ${p.interests}--}%
%{--}--}%
%{--}--}%



</r:script>

<div class="mainContainer">
    <h1>

        <g:each status="i" in="${people.values()}" var="p">
            <g:if test="${(p.id).toString() == (params.nodeId).substring(2)}">
                <img style="max-height: 70px; max-width: 70px; border: 2px solid #ffffff;"
                     src=${p.pic}>&nbsp;${p.name}
            </g:if>
        </g:each>

    </h1>


    <table class="interest">
        <tr>
            <td>
                <table id="table1">
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="green-icon.png"></r:img>&nbsp;Politics
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="green-icon.png"></r:img>&nbsp;Security
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="green-icon.png"></r:img>&nbsp;Hegemony
                    </td></tr>
                </table>
            </td>

            <td>
                <table id="table2">
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="purple-icon.png"></r:img>&nbsp;Descartes
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="purple-icon.png"></r:img>&nbsp;Marx
                    </td></tr>
                    <tr><td>

                    </td></tr>
                </table>
            </td>

            <td>
                <table id="table3">
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="blue-icon.png"></r:img>&nbsp;Globalization
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="blue-icon.png"></r:img>&nbsp;Consumerism
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="blue-icon.png"></r:img>&nbsp;Cultural Studies
                    </td></tr>
                </table>
            </td>

            <td>
                <table id="table4">
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="gray-icon.png"></r:img>&nbsp;Incest
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="gray-icon.png"></r:img>&nbsp;Little Doves
                    </td></tr>
                    <tr><td>
                        <r:img class="interest" dir="images/hviz-images" file="gray-icon.png"></r:img>&nbsp;<a href="#" id="more4">And 12 more...</a>
                    </td></tr>
                </table>
            </td>

            <td style="vertical-align: middle">
                <table class="slider" >
                    <tr>
                        <td class="slider">
                            <div id="green"></div>
                        </td>
                        <td class="slider">Political Science</td>

                    </td>
                    </tr>
                    <tr>
                        <td class="slider">
                            <div id="purple"></div>
                        </td>

                        <td class="slider">Philosophy</td>

                    </tr>
                    <tr>
                        <td class="slider">
                            <div id="blue"></div>
                        </td>
                        <td class="slider">Cultural Studies</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="people">
        <tr class="people">
            <th class="people">
                <div id="dd" class="wrapper-dropdown-3" tabindex="1" style="float: right; vertical-align: middle" >
                    <span>Sort By</span>
                    <ul class="dropdown">
                        <li><a href="#"><r:img dir="images/hviz-images" file="orange-icon.png"></r:img>Overall</a></li>
                        <li><a href="#"><r:img dir="images/hviz-images" file="green-icon.png"></r:img>Political Science</a></li>
                        <li><a href="#"><r:img dir="images/hviz-images" file="purple-icon.png"></r:img>Philosophy</a></li>
                        <li><a href="#"><r:img dir="images/hviz-images" file="blue-icon.png"></r:img>Cultural Studies</a></li>
                    </ul>
                </div>

            <th class="people"><r:img dir="images/hviz-images" file="orange-icon.png"></r:img><br/>Overall</th>

            <g:each in="${clusterMap.keySet()}" var="h">
                <g:each in="${interests.keySet()}" var="i">
                    <g:if test="${h==i}">
                        <th class="people"><img class="h_${h}"><br/>${interests[i].name}</th>
                    </g:if>
                </g:each>
            </g:each>

        </th>
        </tr>


        <g:set var="x" value="${100}"/>
        <g:each status="i" in="${people.values()}" var="p">
            <g:if test="${(p.id).toString() != (params.nodeId).substring(2)}">
                <tr class="people">
                    <td class="people" style="border-right: 2px solid #d3d3d3"><img class="person" src="${p.pic}"> &nbsp; ${p.name}</td>
                    <td class="people"><div class="rect" style="width: ${formattedData[p.id]["overall"]}%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width:  ${100.00-formattedData[p.id]["overall"]}%;background-color:#d3d3d3">&nbsp;</div></td>

                    <g:each in="${clusterMap.keySet()}" var="k">
                        <g:if test="${formattedData[p.id][k.toString()]!=null}">
                            <td class="people"><div class="rect hub_${k}" style="width: ${formattedData[p.id][k.toString()]}%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width:  ${100.00-formattedData[p.id][k.toString()]}%;background-color:#d3d3d3">&nbsp;</div></td>
                        </g:if>
                        <g:else>
                            <td class="people"><div class="rect" style="width:  100%;background-color:#d3d3d3">&nbsp;</div></td>
                        </g:else>
                    </g:each>
                </tr>
            </g:if>
        </g:each>


    </table>
</div>

<div class="tooltip" id="more1Tooltip" style="display: none;position: absolute;">
</div>

<div class="tooltip" id="more2Tooltip" style="display: none;position: absolute;">
</div>

<div class="tooltip" id="more3Tooltip" style="display: none;position: absolute;">
</div>

<div class="tooltip" id="more4Tooltip" style="display: none;position: absolute;">
    <p>Gold <br/>
        Meow <br/>
        Cats <br/>
        Bunnies <br/>
        Rebecca designing stuff<br/>
    </p>
</div>

</body>
</html>