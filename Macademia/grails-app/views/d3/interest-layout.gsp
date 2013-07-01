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
    var clusterMap = {
        "18": [1443, 16204, 323, 295, 3590, 227, 711],
        "24":[307, 773, 3281, 320, 145, 2178, 758],
        "976":[4018, 738, 2710, 2126, 407, 3805, 318],
        "1501":[2581, 223, 10957, 2331, 452, 890, 74]
    };

    var interests = [
        {"id":18, "name":"data mining"},
        {"id":2687, "name":"Text mining", "cluster":18, "relevance":0.7576502561569214, "roles":[]},
        {"id":15677, "name":" text analytics", "cluster":18, "relevance":0.7576502561569214, "roles":[]},
        {"id":19, "name":"machine learning", "cluster":18, "relevance":0.7538068890571594, "roles":[]},
        {"id":925, "name":" regression", "cluster":18, "relevance":0.7336868643760681, "roles":[]},
        {"id":15679, "name":" information visualization", "cluster":18, "relevance":0.724751889705658, "roles":[]},
        {"id":227, "name":"artificial intelligence", "cluster":18, "relevance":0.7178208231925964, "roles":[]}
    ];
    var i = 0;

//    var interests = [
//        {'name' : 'Rock climbing', 'color' : 0.3},
//        {'name' : 'Squash', 'color' : 0.7}
//    ];

    var interest = MC.interest()
        .setCy(function (d) {
            i += 40;
            return i;
        })
        .addOnHover(
            function (d) {
                console.log('in ' + d.name);
                d3.select(this)
                    .selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', 'red');
            },
            function (d) {
                console.log('out ' + d.name);
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

    var interestLayout = MC.interestLayout()

</r:script>

<svg></svg>
</body>
</html>