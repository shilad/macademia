<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 7/3/13
  Time: 1:01 PM
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
     var people = [
         {"id":15830, "fid":250588901, "name":"Luther Rea",  'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
             'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9},
             "pic":"/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
             "relevance":{"-1":null, "976":1.1539017856121063, "24":1,
             "overall":1.0769508928060532}, "count":{"-1":15, "976":2, "24":1, "overall":3},
             "interests":[1223, 15, 17, 21, 20, 23, 22, 25, 601, 27, 1208, 1110, 30, 18, 19, 28, 24]},

     {"id":16, "fid":257, "name":"Donnie Burroughs",
            "pic":"/Macademia/all/image/fake?gender=male&img=00286_940422_fa.png",
             'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
             'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9},
//            "relevance":{"-1":null, "18":1.555315688252449, "24":1,
//            "overall":1.2776578441262245},
//            "count":{"-1":13, "18":3, "24":1, "overall":4},
            "interests":[1223, 15, 17, 21, 20, 23, 22, 25, 601, 27, 1208, 1110, 30, 18, 19, 28, 24]},
//         {"id":2691, "fid":7241482, "name":"Diana Brooks",
//            "pic":"/Macademia/all/image/fake?gender=female&img=00633_940928_fa.png",
//            "relevance":{"18":1.3140089064836502, "-1":null, "976":1, "overall":1.157004453241825}, "count":{"18":3, "-1":5, "976":1, "overall":4},
//            "interests":[2687, 19, 227, 2693, 2692, 2694, 1224, 2688, 976]},
         {"id":15680, "fid":245862401, 'cleanedRelevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
             'interestColors': {4 : 0.5, 5 : 0.3, 6 : 0.2, 11 : 0.9},
         "name":"Ed Sanborn", "pic":"/Macademia/all/image/fake?gender=male&img=00798_941205_fa.png",
             "relevance":{"18":1.7103700954467058, "-1":null, "overall":0.8551850477233529},
             "count":{"18":6, "-1":1, "overall":6},
             "interests":[18, 15677, 15679, 28, 15675, 15678, 15676]}
//         {"id":17198, "fid":295771205, "name":"Emery Etheridge", "pic":"/Macademia/all/image/fake?gender=male&img=00460_940422_fa.png", "relevance":{"18":1.3189659714698792, "976":1.5695229321718216, "-1":null, "24":1, "overall":1.9442444518208504}, "count":{"18":2, "976":3, "-1":8, "24":1, "overall":6}, "interests":[18, 1221, 976, 402, 16597, 1438, 462, 1207, 17193, 17194, 17195, 63, 17196, 24]},
//         {"id":12104, "fid":146506817, "name":"Mario Louis", "pic":"/Macademia/all/image/fake?gender=male&img=00155_940128_fa.png", "relevance":{"18":0.6376854777336121, "24":1, "976":1.604827418923378, "-1":null, "1501":0.661139726638794, "overall":1.951826311647892}, "count":{"18":1, "24":1, "976":3, "-1":2, "1501":1, "overall":6}, "interests":[295, 24, 976, 12103, 12102, 12099, 12101, 12100]},
//         {"id":443, "fid":196250, "name":"Alana Seals", "pic":"/Macademia/all/image/fake?gender=female&img=00071_931230_fa.png", "relevance":{"-1":null, "24":1.5525153130292892, "18":0.6376854777336121, "1501":0.6479836702346802, "overall":1.4190922304987907}, "count":{"-1":15, "24":3, "18":1, "1501":1, "overall":5}, "interests":[444, 445, 446, 447, 948, 946, 947, 456, 455, 454, 453, 451, 450, 449, 448, 24, 457, 145, 295, 452]},
//         {"id":11412, "fid":130233745, "name":"Jame Hyatt", "pic":"/Macademia/all/image/fake?gender=male&img=00627_940928_fa.png", "relevance":{"-1":null, "1501":1.2077298909425735, "24":1, "overall":1.1038649454712868}, "count":{"-1":2, "1501":3, "24":1, "overall":4}, "interests":[11410, 11411, 245, 1079, 2375, 24]},
//         {"id":12159, "fid":147841282, "name":"Mavis Storey", "pic":"/Macademia/all/image/fake?gender=female&img=00791_941205_fa.png", "relevance":{"-1":null, "24":1.609576590359211, "overall":0.8047882951796055}, "count":{"-1":7, "24":4, "overall":4}, "interests":[204, 2080, 156, 12158, 78, 846, 1895, 24, 955, 44, 1281]},
//         {"id":15869, "fid":251825162, "name":"Gabrielle Tapia", "pic":"/Macademia/all/image/fake?gender=female&img=00112_931230_fa.png", "relevance":{"-1":null, "24":1.3015805780887604, "1501":0.6328731179237366, "976":0.6147075891494751, "18":0.6469489932060242, "overall":1.598055139183998}, "count":{"-1":5, "24":2, "1501":1, "976":1, "18":1, "overall":5}, "interests":[15863, 2541, 15868, 15867, 15866, 24, 1281, 890, 15865, 15864]},
//         {"id":1076, "fid":1157777, "name":"Melvin Strickland", "pic":"/Macademia/all/image/fake?gender=male&img=00004_930831_fa.png", "relevance":{"24":1.491046518087387, "1501":1.1455507427453995, "-1":null, "18":0.9407278299331665, "overall":1.7886625453829765}, "count":{"24":3, "1501":3, "-1":4, "18":2, "overall":8}, "interests":[24, 924, 1077, 293, 1079, 1073, 447, 43, 1072, 1078, 295, 1074]},
//         {"id":10961, "fid":120143522, "name":"Amber Broome", "pic":"/Macademia/all/image/fake?gender=female&img=00399_940422_fa.png", "relevance":{"-1":null, "976":1.7213415876030922, "1501":0.6577069759368896, "overall":1.189524281769991}, "count":{"-1":8, "976":5, "1501":1, "overall":6}, "interests":[10263, 1676, 10960, 2151, 10954, 10953, 10958, 10956, 976, 402, 10955, 2010, 10959, 10957]},
//         {"id":17798, "fid":316768805, "name":"Clay Warner", "pic":"/Macademia/all/image/fake?gender=male&img=00713_941201_fa.png", "relevance":{"1501":0.6564915776252747, "976":1.4195661544799805, "18":0.6469489932060242, "overall":1.3615033626556396}, "count":{"1501":1, "976":2, "18":1, "overall":4}, "interests":[223, 976, 4018, 15864]},
//         {"id":17537, "fid":307546370, "name":"Lillie Morrow", "pic":"/Macademia/all/image/fake?gender=female&img=00317_940422_fa.png", "relevance":{"1501":0.6564915776252747, "976":1.4195661544799805, "18":0.6469489932060242, "overall":1.3615033626556396}, "count":{"1501":1, "976":2, "18":1, "overall":4}, "interests":[223, 976, 4018, 15864]},
//         {"id":4367, "fid":19070690, "name":"Sarah Mayfield", "pic":"/Macademia/all/image/fake?gender=female&img=00393_940422_fa.png", "relevance":{"1501":1.5325594991445541, "-1":null, "overall":0.7662797495722771}, "count":{"1501":3, "-1":2, "overall":3}, "interests":[1501, 243, 223, 15117, 15116]},
//         {"id":18318, "fid":335549125, "name":"Herschel Garland", "pic":"/Macademia/all/image/fake?gender=male&img=00064_931230_fa.png", "relevance":{"1501":1.7000646516680717, "-1":null, "24":0.683821976184845, "976":1.5629120469093323, "overall":1.9733993373811245}, "count":{"1501":5, "-1":3, "24":1, "976":3, "overall":9}, "interests":[1501, 2331, 18316, 223, 984, 1445, 18317, 319, 320, 976, 402, 318]},
//         {"id":10493, "fid":110103050, "name":"Sonja Lord", "pic":"/Macademia/all/image/fake?gender=female&img=00609_940928_fa.png", "relevance":{"-1":null, "1501":0.9457209408283234, "18":1.3581135645508766, "overall":1.1519172526896}, "count":{"-1":3, "1501":2, "18":5, "overall":7}, "interests":[10492, 10490, 10491, 3130, 10487, 10486, 227, 323, 10488, 10489]},
//         {"id":18134, "fid":328841957, "name":"Carmelo Looney", "pic":"/Macademia/all/image/fake?gender=male&img=00230_940128_fa.png", "relevance":{"24":1.4297183435410261, "-1":null, "18":1.0485795140266418, "overall":1.239148928783834}, "count":{"24":6, "-1":7, "18":2, "overall":8}, "interests":[18131, 18133, 10779, 18130, 18132, 18125, 18127, 1124, 18126, 18431, 287, 18129, 11334, 18128, 977]},
];
     var interests = [
//        {"18": [1443, 16204, 323, 295, 3590, 227, 711]},
         {"id":4, "name":"WINNING", "cluster" : 18,'x':290, 'y':290} ,
         {"id":5, "name":"gum",  "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000', 'x':200, 'y':200},
         {"id":6, "name":"shoe", "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':20, 'y':20},
         {"id":11, "name":"ben hillman", "cluster":18,"parentId":"18", "relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':250, 'y':250},
         {"id":14, "name":"Text mining", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[], 'color':'#000000','x':300, 'y':300},
//         {"id":16204, "name":" text analytics", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[]},
//         {"id":323, "name":"machine learning", "cluster":18, "parentId":"18","relevance":0.7538068890571594, "roles":[]},
//         {"id":295, "name":" regression", "cluster":18,"parentId":"18", "relevance":0.7336868643760681, "roles":[]},
//         {"id":3590, "name":" information visualization", "cluster":18, "parentId":"18","relevance":0.724751889705658, "roles":[]},
//         {"id":227, "name":"artificial intelligence", "cluster":18, "relevance":0.7178208231925964, "parentId":"18","roles":[] },
//         {"id":711, "name":"artificial gum chewing", "cluster":18, "relevance":0.718208231925964, "parentId":"18","roles":[] }
     ];


    var i = 30;
    var person = MC.person()
        .setCy(function(d) {
               i+= 80;
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
             .attr('width', 800)
             .attr('height', 800)
             .selectAll('g.person')
             .data(people)
             .enter()
             .call(person);


     var interest = MC.interest()
             .setCx(function (d) { return d.x; })
             .setCy(function (d) { return d.y; })
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
             .selectAll('g.interest')
             .data(interests)
             .enter()
             .call(interest);

    var interestNodes = d3.selectAll('g.interest');
    var personNodes  = d3.selectAll('g.person');


    var personLayout = MC.personLayout()
            .setPeople(personNodes)
            .setInterests(interests)
            .setInterestNodes(interestNodes) ;

     d3.select('svg')
            .selectAll('person-layouts')
            .data([0])
            .enter()
            .call(personLayout);
</r:script>
<svg>
</svg>

</body>
</html>