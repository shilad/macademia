<%--
  Created by IntelliJ IDEA.
  User: shilad
  Date: 5/10/13
  Time: 3:38 PM
  To change this template use File | Settings | File Templates.
--%>

%{--a change to push--}%

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

    var interests1 = [
        {'id' : 34, 'name' : 'Espeon', 'color' : 0.5, 'r': 15, 'cx' : 50, 'cy' : 200},
        {'id' : 31, 'name' : 'Umbreon', 'color' : 0.69, 'r': 5, 'cx' : 150, 'cy' : 200}
    ];

    var interests2 = [
        {'id' : 34, 'name' : 'Espeon', 'color' : 0.5, 'r': 15, 'cx' : 150, 'cy' : 200},
        {'id' : 39, 'name' : 'Squirtle', 'color' : 0.3, 'r': 10, 'cx' : 100, 'cy' : 199}
    ];

    // Create d3 template that knows how to create svg elements for data
    var interest = MC.interest()
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

    // Ask d3 to create svg elements by applying the template to interest data
    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .datum(interests1)
            .call(interest);


//    window.setTimeout(function() {
//        var interest = MC.interest();
//        d3.select('svg')
//                .datum(interests2)
//                .call(interest);
//
//    }, 1500);


</r:script>

<svg>
</svg>
</body>
</html>