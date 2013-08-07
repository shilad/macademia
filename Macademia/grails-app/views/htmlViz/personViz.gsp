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

    })
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

</r:script>

<div class="mainContainer">
    <h1><img style="max-height: 70px; max-width: 70px; border: 2px solid #ffffff;"
             src="http://localhost:8080/Macademia/all/image/randomFake?top">&nbsp;Cersei Lannister</h1>


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


    <table>
        <g:each status="i" in="${people.values()}" var="p">
            <tr>
                <td><img class="person" src="${p.pic}">&nbsp;${p}</td>
                <g:each status="j" in="${p.interests}" var="interestID">
                    <td>${interests[interestID]}</td>
                </g:each>
            </tr>
        </g:each>
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
            </th>
            <th class="people"><r:img dir="images/hviz-images" file="orange-icon.png"></r:img><br/>Overall</th>
            <th class="people"><r:img dir="images/hviz-images" file="green-icon.png"></r:img><br/>Political Science</th>
            <th class="people"><r:img dir="images/hviz-images" file="purple-icon.png"></r:img><br/>Philosophy</th>
            <th class="people"><r:img dir="images/hviz-images" file="blue-icon.png"></r:img><br/>Cultural Studies</th>
        </tr>

        <tr class="people">
            <td class="people" style="border-right: 2px solid #d3d3d3;"><a href="http://localhost:8080/Macademia/all/image/randomFake?1"><img class="person" src="http://localhost:8080/Macademia/all/image/randomFake?1"></a> Petyr Baelish</td>
            <td class="people"><div class="rect" style="width: 90%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width: 10%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 80%;background-color:#b4f5a3">&nbsp;</div><div class="rect" style="width: 20%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 75%;background-color:#b2a3f5">&nbsp;</div><div class="rect" style="width: 25%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 82%;background-color:#A8C4E5">&nbsp;</div><div class="rect" style="width: 18%;background-color:#d3d3d3">&nbsp;</div></td>
        </tr>
        <tr class="people">
            <td class="people" style="border-right: 2px solid #d3d3d3;"><a href="http://localhost:8080/Macademia/all/image/randomFake?2"><img class="person" src="http://localhost:8080/Macademia/all/image/randomFake?2"></a> Lord Varys</td>
            <td class="people"><div class="rect" style="width: 88%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width: 12%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 78%;background-color:#b4f5a3">&nbsp;</div><div class="rect" style="width: 22%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 65%;background-color:#b2a3f5">&nbsp;</div><div class="rect" style="width: 35%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 90%;background-color:#A8C4E5">&nbsp;</div><div class="rect" style="width: 10%;background-color:#d3d3d3">&nbsp;</div></td>
        </tr>
        <tr class="people">
            <td class="people" style="border-right: 2px solid #d3d3d3;"><a href="http://localhost:8080/Macademia/all/image/randomFake?3"><img class="person" src="http://localhost:8080/Macademia/all/image/randomFake?3"></a> Sansa Stark</td>
            <td class="people"><div class="rect" style="width: 85%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width: 15%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 79%;background-color:#b4f5a3">&nbsp;</div><div class="rect" style="width: 21%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 50%;background-color:#b2a3f5">&nbsp;</div><div class="rect" style="width: 50%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 95%;background-color:#A8C4E5">&nbsp;</div><div class="rect" style="width: 5%;background-color:#d3d3d3">&nbsp;</div></td>
        </tr>
        <tr class="people">
            <td class="people" style="border-right: 2px solid #d3d3d3;"><a href="http://localhost:8080/Macademia/all/image/randomFake?4"><img class="person" src="http://localhost:8080/Macademia/all/image/randomFake?4"></a> Maester Pycelle</td>
            <td class="people"><div class="rect" style="width: 80%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width: 20%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 83%;background-color:#b4f5a3">&nbsp;</div><div class="rect" style="width: 17%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 90%;background-color:#b2a3f5">&nbsp;</div><div class="rect" style="width: 10%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 45%;background-color:#A8C4E5">&nbsp;</div><div class="rect" style="width: 55%;background-color:#d3d3d3">&nbsp;</div></td>
        </tr>
        <tr class="people" style="border-bottom: none">
            <!--last row must have border-bottom: none because of the big boarder around everything-->
            <td class="people" style="border-right: 2px solid #d3d3d3;"><a href="http://localhost:8080/Macademia/all/image/randomFake?5"><img class="person" src="http://localhost:8080/Macademia/all/image/randomFake?5"></a> Joffery Baratheon</td>
            <td class="people"><div class="rect" style="width: 63%;background-color:#f2b06e">&nbsp;</div><div class="rect" style="width: 37%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 60%;background-color:#b4f5a3">&nbsp;</div><div class="rect" style="width: 40%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 30%;background-color:#b2a3f5">&nbsp;</div><div class="rect" style="width: 70%;background-color:#d3d3d3">&nbsp;</div></td>
            <td class="people"><div class="rect" style="width: 60%;background-color:#A8C4E5">&nbsp;</div><div class="rect" style="width: 40%;background-color:#d3d3d3">&nbsp;</div></td>
        </tr>
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
        Royalty <br/>
        Pretty Dresses <br/>
        My Children <br/>
    </p>
</div>

</body>
</html>