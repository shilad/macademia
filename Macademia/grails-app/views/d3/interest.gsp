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
        {'name' : 'Espeon', 'color' : 0.5, 'r': 15},
        {'name' : 'Umbreon', 'color' : 0.69, 'r': 5}
    ];

    var interest = MC.interestZ()
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
            })
            .setEnterTransition(function() {
                this.attr('opacity', 1)
                    .duration(1000);
            });

    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .datum(interests)
            .call(interest);


    window.setTimeout(function() {
        interests[0].r *= 2
        var interest = MC.interestZ()
                .setUpdateTransition(function () {
                    this.duration(1000);
                })
                .setCy(function (d) {
                    i += 40;
                    return i;
                });
        d3.select('svg')
                .datum(interests)
                .call(interest);

    }, 1000);


</r:script>

<svg>
</svg>
</body>
</html>