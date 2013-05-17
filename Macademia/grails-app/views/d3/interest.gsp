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

.interest {
    font: 13px Georgia;
    fill: #000;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var i = 0;

    var interests = [
        {'name' : 'Rock climbing', 'color' : 0.3},
        {'name' : 'Squash', 'color' : 0.7}
    ];

    var interest = MC.interest()
        .setCy(function (d) {
            i += 40;
            return i;
        })
        .addOnHover(
            function (d) {
                d3.select(this)
                    .selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', 'red');
            },
            function (d) {
                d3.select(this)
                        .selectAll('text')
                        .transition()
                        .duration(200)
                        .attr('fill', 'black');
            });

    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .selectAll('interests')
            .data([0])
            .append('g')
            .attr('class', 'interests')
            .data(interests)
            .enter()
            .call(interest);
</r:script>

<svg></svg>
</body>
</html>