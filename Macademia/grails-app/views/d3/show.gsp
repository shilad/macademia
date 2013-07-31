<%--
  Created by IntelliJ IDEA.
  User: zixiao
  Date: 7/31/13
  Time: 10:59 AM
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
    fill: #C0C0C0;
}

.active {
    fill: black;
}

.activeInterest{
    /*
    This should have the same css style as interest except we are using
    a different fill
    */
    font: 13px Georgia;
    fill: black;
}

.interest{
    font: 13px Georgia;
    fill: #C0C0C0;
}
</style>

<r:script>
    //maybe load model here for testing
    var rootClass = "person";
    var rootId = 16;
    var url = macademia.makeActionUrlWithGroup('all', 'explore', rootClass + 'Data') + '/' + rootId;
    var self = this;
    $.ajax({
        url: url,
        dataType : 'json',
        success : function (json) {
            console.log('We got the data');
            var model = new VizModel(json);
            console.log(model);
            var interests = model.getInterests(); //we can just use this
            var peeps = model.getPeople(); //we can just use this
            var clusterMap = model.getClusterMap();
            console.log(interests);
            console.log(peeps);
            console.log(clusterMap);

            //building hubs
            var hubs = []
            for (var key in clusterMap){
                hubs.push({type:'interest', id:key, children:clusterMap[key]});
            }
            console.log(hubs);

            //building relatednessMap
        }
    });


    var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);


    //    var viz = new MC.MainViz({
    //        hubs: hubs,
    //        root: root,
    //        interests: interests,
    //        people: peeps,
    //        svg : svg,
    //        colors: colors,
    //        relatednessMap:relatednessMap
    //    });


</r:script>

<svg>
</svg>

</body>
</html>