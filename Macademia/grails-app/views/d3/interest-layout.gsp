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
.interest.hub {
    font: 15px Helvetica;
    font-weight: bold;
    fill: #000;
}
svg {
    height : 90%;
    width : 90%;
}

</style>
<r:script>
    var interests = [
        {"id": 18, "name": "WINNING", "cluster": 18, "color": "#ff4444"} ,
        {"id": 24, "name": "gum", "cluster": 18, "parentId": "18", "relevance": 0.7576502561569214, "roles": [], "color": "#9a679f"},
        {"id": 976, "name": "shoe", "cluster": 18, "parentId": "18", "relevance": 0.7576502561569214, "roles": [], "color": "#81a3d0"},
        {"id": 1501, "name": "ben hillman", "cluster": 18, "parentId": "18", "relevance": 0.7576502561569214, "roles": [], "color": "#ffbd55"},
        {"id": 1443, "name": "Text mining", "cluster": 18, "parentId": "18", "relevance": 0.7576502561569214, "roles": []},
        {"id": 16204, "name": " text analytics", "cluster": 18, "parentId": "18", "relevance": 0.7576502561569214, "roles": []},
        {"id": 323, "name": "machine learning", "cluster": 18, "parentId": "18", "relevance": 0.7538068890571594, "roles": []},
        {"id": 295, "name": " regression", "cluster": 18, "parentId": "18", "relevance": 0.7336868643760681, "roles": []},
        {"id": 3590, "name": " information visualization", "cluster": 18, "parentId": "18", "relevance": 0.724751889705658, "roles": []},
        {"id": 227, "name": "artificial intelligence", "cluster": 18, "relevance": 0.7178208231925964, "parentId": "18", "roles": [] },
        {"id": 711, "name": "kittens", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 20, "name": "debugging", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 7, "name": "game of thrones", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 42, "name": "space", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 27, "name": "espeon", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 5, "name": "pikachu", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 150, "name": "mew", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 88, "name": "magic", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 25, "name": "dragons", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 43, "name": "cow", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 77, "name": "blastoise", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 993, "name": "charmander", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 543, "name": "ninjas", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 9001, "name": "world domination", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
        ,
        {"id": 99405, "name": "bunnies", "cluster": 18, "relevance": 0.718208231925964, "parentId": "18", "roles": [] }
    ];

    var clusterMap = {
        "18": ["1443", "16204", "1501", "24", "976", "43"],
        "24": ["323", "295", "27", "5", "150", "88"],
        "976": ["3590", "25", "993", "543", "9001", "99405"],
        "1501": ["227", "711", "20", "7", "42", "77"]
    };


    var i = 40;

    var interestTemplate = MC.interest()
            .setColor(function (d) {
                return d.color
            });

    d3.select('svg')
            .attr('width', 800)
            .attr('height', 800)
            .datum(interests)
            .call(interestTemplate);

    var interestLayout = MC.interestLayout()
            .setDiameter(500)
            .setInterests(interests)
            .setClusterMap(clusterMap)
            .setRootId('18')
            .setInterestNodes(d3.selectAll('g.interest'));

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