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
                    }
//        {
//            'name' : 'Shilad Sen',
//            'pic' : '/Macademia/all/image/randomFake?foo',
//            'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
//            // TODO: interestColors goes away, replaced with hashtable of interest ids to interest objects
//            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7}
//        }
//        {
//             ,
//            'pic' : '/Macademia/all/image/randomFake?bar',
//            'cleanedRelevance':  {5 : 1.0, 6: 3.0, 14: 5.0},
//            'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9, 14 : 0.7}
//        }
    ];

    var interests = [
//        {"18": [1443, 16204, 323, 295, 3590, 227, 711]},
        {"id":4, "type": 'interest', "name":"WINNING", "cluster" : 4,'x':590, 'y':290} ,
        {"id":5, "type": 'interest', "name":"gum",  "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'#000000', 'x':200, 'y':200},
        {"id":6, "type":'interest', "name":"shoe", "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':20, 'y':20},
        {"id":11, "type":'interest', "name":"ben hillman", "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':250, 'y':250},
        {"id":14, "type": 'interest',"name":"Text mining", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':300, 'y':300}
//         {"id":16204, "type": interest,"name":" text analytics", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[]},
//         {"id":323, "type": interest,"name":"machine learning", "cluster":18, "parentId":"18","relevance":0.7538068890571594, "roles":[]},
//         {"id":295, "type": interest,"name":" regression", "cluster":18,"parentId":"18", "relevance":0.7336868643760681, "roles":[]},
//         {"id":3590, "type": interest,"name":" information visualization", "cluster":18, "parentId":"18","relevance":0.724751889705658, "roles":[]},
//         {"id":227, "type": interest,"name":"artificial intelligence", "cluster":18, "relevance":0.7178208231925964, "parentId":"18","roles":[] },
//         {"id":711, "type": interest,"name":"artificial gum chewing", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
    ];



    var hubs = [[{
        "id": 8,
        "name":"web2.0",
        "type":"interest",
        "r": 45,
        "cx":375,
        "cy":150,
        'interests': [
            {"id": 11, "name": "html5","r":18},
            {"id": 12, "name": "javascript","r":18},
            {"id": 13, "name": "Web Development","r":18},
            {"id": 14, "name": "wikis", "r":18},
            {"id": 15, "name": "Web Spam", "r":18},
            {"id": 16, "name": "Semantic Web", "r":18}
        ]
    }],
        [{
            "id":9,
            'name':'Jazz',
            'type':'interest',
            'r': 45,
            'cx' : 150,
            'cy' : 600,
            'interests': [
                {"id": 21, "name": "Miles Davis","r":18},
                {"id": 22, "name": "Jazz History","r":18},
                {"id": 23, "name": "Every Day","r":18},
                {"id": 24, "name": "Duke Ellington", "r":18},
                {"id": 25, "name": "Jazz Performance", "r":18},
                {"id": 26, "name": "Mary Lou Williams", "r":18}
            ]
        }],
        [{
            "id":10,
            'name':'Mathematics',
            'type':'interest',
            'r': 45,
            'cx' : 600,
            'cy' : 600,
            'interests': [
                {"id": 13, "name": "Mathematical Methods","r":18},
                {"id": 23, "name": "Philosophy of Mathematics","r":18},
                {"id": 33, "name": "Geometry","r":18},
                {"id": 43, "name": "Algebra", "r":18},
                {"id": 53, "name": "Calculus", "r":18},
                {"id": 63, "name": "Discrete Mathematics", "r":18}
            ]
        }]];

    var person = MC.person()
        .setInterests(interests)
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