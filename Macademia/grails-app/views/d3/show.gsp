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
//    $.ajax({
//        url: url,
//        dataType : 'json',
//        success : function (json) {
//    });
    $.getJSON(url, function(json){
            console.log('We got the data');
            var model = new VizModel(json);
            console.log(model);
            //notice that interests has relatedQueryId that
            //tell us which cluster it belongs to
            var interests = model.getInterests();
            var peeps = model.getPeople();
            var clusterMap = model.getClusterMap();
            console.log('interests:');
            console.log(interests);
            console.log('peeps:');
            console.log(peeps);
            console.log(clusterMap);

            //building hubs
            var hubs = []
            for (var key in clusterMap){
                hubs.push({type:'interest', id:Number(key), children:clusterMap[key]});
            }
            console.log('hubs:');
            console.log(hubs);

            //building root
            var root = {type:'person',id:rootId, children: peeps[rootId].interests};

            //building relatednessMap and parse interests
            var relatednessMap = {};
            for(var key in interests){
                var interest = interests[key];
                var clusterId = interests[key].cluster;
                if(clusterId != -1){
                    if(relatednessMap[clusterId]){
                        relatednessMap[clusterId].push(Number(key));
                    } else {
                        var value = [Number(key)];
                        relatednessMap[clusterId]=value;
                    }
                }
                //parse the interest id, we need number
                interests[key].id = Number(interests[key].id);
            }
            console.log('relatednessMap');
            console.log(relatednessMap);

            var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);
            var colors =[
                "#f2b06e",
                "#f5a3d6",
                "#b2a3f5",
                "#a8c4e5",
                "#b4f5a3"
            ];
            var viz = new MC.MainViz({
                hubs: hubs,
                root: root,
                interests: interests,
                people: peeps,
                svg : svg,
                colors: colors,
                relatednessMap:relatednessMap
            });
     });




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