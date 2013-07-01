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

.testLabel {
    font: 20px Georgia;
    fill: #00b;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var i = 0;
    var label = MC.label()
        .setCssClass('testlabel')
        .setText(function (d) { return d; })
        .setY(function (d) {
            return (++i) + 'em';
        })
        .addOnHover(
            function (d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('fill', 'red');
            },
            function (d) {
                d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('fill', 'black');
            });

    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .selectAll('labels')
            .attr('class', 'labels')
            .data(['foo', 'bar', 'baz'])
            .enter().call(label);
</r:script>

<svg></svg>
</body>
</html>