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
    fill: gray;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var i = 0;
    var labels = [
        {text : 'foo', x : 100, y : 200},
        {text : 'bar', x : 150, y : 100},
        {text : 'baz', x : 50,  y : 50}
    ];
    var label = MC.label()
        .setCssClass('testlabel')
        .addOnHover(
            function (d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('fill', 'gray');
            },
            function (d) {
                d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('fill', 'black');
            }
    );

    d3.select('svg')
            .datum(labels)
            .call(label);
</r:script>

<svg></svg>
</body>
</html>