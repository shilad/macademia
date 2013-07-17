<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 7/16/13
  Time: 10:41 AM
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
.hub {
    font: 13px Georgia;
    fill: #000;
}
svg {
    height : 90%;
    width : 90%;
}
</style>

<r:script>

    var root = {"id": 7, "name":"Stark", "type":"interest","cx":300,"cy":300,"r":20};

    var interests = [
        {"id": 1, "name": "Robb", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [], "r":5},
        {"id": 2, "name": "Sansa", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [], "r":5},
        {"id": 3, "name": "Arya", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [],"r":5},
        {"id": 4, "name": "Bran", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [],"r":5},
        {"id": 5, "name": "Rickon", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [],"r":5},
        {"id": 6, "name": "Jon Snow", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": [],"r":5}
    ];

    var hubModel = {
        root : root,
        children : interests,
        color : 0.4
    };

    var template = MC.hub();

    d3.select('svg')
            .attr('width', 500)
            .attr('height', 500)
            .datum(hubModel)
            .call(template);
</r:script>

<svg>

</svg>

</body>
</html>