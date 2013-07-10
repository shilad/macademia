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
    font: 13px Helvetica;
    fill: #DCDCDC;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    //when I added parentID it caused the hilighted click to remain hilighted until next click
    var interests = [
//        {"18": [1443, 16204, 323, 295, 3590, 227, 711]},
        {"id":18, "name":"WINNING", "cluster" : 18} ,
        {"id":24, "name":"gum",  "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000'},
        {"id":976, "name":"shoe", "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000'},
        {"id":1501, "name":"ben hillman", "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000'},
        {"id":1443, "name":"Text mining", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[], 'color':'#000000'},
        {"id":16204, "name":" text analytics", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[]},
        {"id":323, "name":"machine learning", "cluster":18, "parentId":"18","relevance":0.7538068890571594, "roles":[]},
        {"id":295, "name":" regression", "cluster":18,"parentId":"18", "relevance":0.7336868643760681, "roles":[]},
        {"id":3590, "name":" information visualization", "cluster":18, "parentId":"18","relevance":0.724751889705658, "roles":[]},
        {"id":227, "name":"artificial intelligence", "cluster":18, "relevance":0.7178208231925964, "parentId":"18","roles":[] },
        {"id":711, "name":"artificial gum chewing", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":20, "name":"debugging", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":7, "name":"game of thrones", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":42, "name":"space", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":27, "name":"espeon", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":5, "name":"pikachu", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":150, "name":"mew", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":88, "name":"magic", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":25, "name":"dragons", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":43, "name":"cow", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":6, "name":"baseball", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ,   {"id":44, "name":"green", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }

    ];

    var cloneInterests = $.extend(true, [], interests);

    var clusterMap = {
        "18": ["1443", "16204", "1501", "24", "976", "43", "44"],
        "44" : ["6"],
        "24":["323", "295", "27", "5", "150", "88"],
        "976":["3590", "25"],
        "1501":["227", "711", "20", "7", "42"]
    };


    var i = 40;

    var interest = MC.interest()
        .setCx(0)
//        .setCy(function (d) {
//                console.log('in ' + d.name);
//                i += 40;
//                return i;
//        })
        .setCy(0)
        .addOnHover(
            function (d) {
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

//    var interestLayout = MC.interestLayout()
//
//    d3.select(clusterMap)
//            .values("18")
////     d3.entries(clusterMap)
//
    d3.select('svg')
            .attr('width', 800)
            .attr('height', 800)
            .selectAll('interests')
//            .data([129483571])
//            .enter()
//            .append('g')
            .attr('class', 'interests')
            .data(interests)
            .enter()
            .call(interest)[0];


    var interestNodes = d3.selectAll('g.interest');
    var interestLayout = MC.interestLayout()
            .setDiameter(500)
            .setInterests(cloneInterests)
            .setClusterMap(clusterMap)
            .setRootId('18')
            .setInterestNodes(interestNodes);

    d3.select('svg')
            .selectAll('interest-layouts')
            .data([0])
            .enter()
            .call(interestLayout);




</r:script>

<svg>
</svg>
</body>
</html>