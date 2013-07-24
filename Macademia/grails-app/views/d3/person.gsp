<%--
  Created by IntelliJ IDEA.
  User: shilad
  Date: 5/10/13
  Time: 3:38 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main"/>

    <r:require modules="d3js"/>

    <title></title>
</head>
<body>

<style type="text/css">

.person {
    font: 17px Georgia;
    fill: #333;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var people = [
        {
            'id' : 34,
            'name' : 'Shilad Senz',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'relevance':  {4 : 3.0, 6: 8.3, 14: 1.0, 5: 1.0, 'overall' : 34},
            'cx' : 50,
            'cy' : 100,
            'interestColors': {4 : "purple", 5 : "#f00", 6 : "pink", 14 : "blue"}
        },
        {
            'id' : 39,
            'name' : 'Shilad Senp',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'relevance':  {4 : 3.0, 6: 8.3, 14: 1.0, 5: 1.0, 'overall' : 34},
            'cx' : 150,
            'cy' : 200,
            'interestColors': {4 : "purple", 5 : "#f00", 6 : "pink", 14 : "blue"}
        },
        {
            'id' : 94,
            'name' : 'Shilad Senp',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'relevance':  {4 : 3.0, 6: 8.3, 14: 1.0, 5: 1.0, 'overall' : 34},
            'cx' : 300,
            'cy' : 99,
            'interestColors': {4 : "purple", 5 : "#f00", 6 : "pink", 14 : "blue"}
        }
    ];

    var person = MC.person()
        .addOnHover(
            function (d) {
                d3.select(this)
                    .selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', 'black');
            },
            function (d) {
                d3.select(this)
                        .selectAll('text')
                        .transition()
                        .duration(200)
                        .attr('fill', '#DCDCDC');
            });

    d3.select('svg')
            .datum(people.slice(0,2))
            .call(person);

    window.setTimeout(
            function() {
                people[0].cx = 200;
                people[0].cy = 200;
                people[1].cx = 100;
                people[1].cy = 75;
                d3.select('svg')
                        .datum(people)
                        .call(person)
            }, 1000);
</r:script>

<svg></svg>
</body>
</html>