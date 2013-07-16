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
  <title></title>
</head>
<body>

<r:script>

    var root = {"id": 7, "name":"Stark", "type":"interest"};

    var interests = [
        {"id": 1, "name": "Robb", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []},
        {"id": 2, "name": "Sansa", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []},
        {"id": 3, "name": "Arya", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []},
        {"id": 4, "name": "Bran", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []},
        {"id": 5, "name": "Rickon", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []},
        {"id": 6, "name": "Jon Snow", "cluster": 7, "parentId": "7", "relevance": 0.7576502561569214, "roles": []}
    ];

    var hubModel = {
        root : root,
        children : interests,
        color : 0.4
    };

    var template = MC.hub();

    d3.select('svg')
            .datum(hubModel)
            .call(template);
</r:script>

</body>
</html>