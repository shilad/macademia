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
    fill: #DCDCDC;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var i = 0;

    var people = [
        {
            'name' : 'Shilad Sen',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
            // TODO: interestColors goes away, replaced with hashtable of interest ids to interest objects
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7}
        },
        {
            'name' : 'Shilad Sen',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
            // TODO: interestColors goes away, replaced with hashtable of interest ids to interest objects
            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7}
        }
//        {
//             ,
//            'pic' : '/Macademia/all/image/randomFake?bar',
//            'cleanedRelevance':  {5 : 1.0, 6: 3.0, 14: 5.0},
//            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7}
//        }
    ];

    var person = MC.person()
        .setCy(function (d) {
            i += 100;
            return i;
        })
        .addOnHover(
            function (d) {
                console.log('in ' + d.name);
                d3.select(this)
                    .selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', 'black');
            },
            function (d) {
                console.log('out ' + d.name);
                d3.select(this)
                        .selectAll('text')
                        .transition()
                        .duration(200)
                        .attr('fill', '#DCDCDC');
            });

    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .selectAll('people')
            .data([0])
            .append('g')
            .attr('class', 'people')
            .data(people)
            .enter()
            .call(person);
</r:script>

<svg></svg>
</body>
</html>