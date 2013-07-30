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

.interest {
    font: 13px Georgia;
    fill: #C0C0C0;
}

.activeInterest {
    /*
    This should have the same css style as interest except we are using
    a different fill
    */
    font: 13px Georgia;
    fill: black;
}



#div1 {
    position:absolute;
    width : 230;
    background-color: #eaeaea;
    border: 3px dotted #ffffff;
    font: 13px Georgia;
    color: pink;
    border-radius: 5px;
    padding: 10px 15px;
}

/*div[class=ttDesc] {*/
    /*display:none;*/
/*}*/

/*div[class=ttName]{*/
    /*display:none;*/
/*}*/











svg {
    position: absolute;
    top: 300px;
    /*height : 90%;*/
    /*width : 90%;*/
}

</style>




<r:script>
var interests = {
    3: {"id": 3, "name": "Online Communities"},
    6: {"id": 6, "name": "web2.0"},
    2: {"id": 2, "name": "Data Mining"},
    1: {"id": 1, "name": "Machine Learning"},
    4: {"id": 4, "name": "Jazz"},
    5: {"id": 5, "name": "Statistics"},
//        8: {"id": 8, "name": "Web2.0"},
    9: {"id": 9, "name": "Jay-Z"},
    10: {"id": 10, "name": "Mathh"},
    11: {"id": 11, "name": "html5"},
    12: {"id": 12, "name": "javascript"},
    13: {"id": 13, "name": "Web Development"},
    14: {"id": 14, "name": "wikis"},
    15: {"id": 15, "name": "Web Spam"},
    16: {"id": 16, "name": "Semantic Web"},
    21: {"id": 21, "name": "Miles Davis"},
    22: {"id": 22, "name": "Jazz History"},
    24: {"id": 24, "name": "Duke Ellington"},
    25: {"id": 25, "name": "Jazz Performance"},
    26: {"id": 26, "name": "Mary Lou Williams"},
    23: {"id": 23, "name": "Philosophy of Mathematics"},
    33: {"id": 33, "name": "Geometry"},
    43: {"id": 43, "name": "Algebra"},
    53: {"id": 53, "name": "Calculus"},
    63: {"id": 63, "name": "Discrete Mathematics"}
};
var peeps = {
    2255: {"id": 2255,
        "name": "Luther Rea",
        "pic": "/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
        "relevance": {
            "11": 1.77,
            "overall": 1.0769508928060532},
        "interests": [
            11,
            22]},
    3010: {"id": 3010,
        "name": "Donnie Burroughs",
        "pic": "/Macademia/all/image/fake?gender=male&img=00286_940422_fa.png",
        "relevance": {
            "11": 1.1563,
            "13": 1.6563,
            "33": 0.9563,
            "overall": 1.2776578441262245},
        "interests": [
            13,
            33,
            11]},
    228: {"id": 228,
        "name": "Thomas Hanks",
        "pic": "/Macademia/all/image/fake?gender=male&img=00287_940422_fa.png",
        "relevance": {
            "13": 1.6563,
            "33": 1.9563,
            "overall": 1.1776578441262245},
        "interests": [
            21,
            23,
            16]},
    16: {
        "id": 16,
        'name': 'Shilad Sen',
        'pic': '/Macademia/all/image/randomFake?foo',
        'relevance': {
            "11": 1.1563,
            "13": 1.6563,
            "overall": 1.1776578441262245},
        'interests': [3, 6, 1, 4, 5]
    }
};

var colors = [
    "#f2b06e",
    "#f5a3d6",
    "#b2a3f5",
    "#a8c4e5",
    "#b4f5a3"
];
var gradientCircles = [
    {'id': 31, 'color': "#b2a3f5", 'r': 170, 'cx': 375, 'cy': 150, "stop-opacity": .5},
    {'id': 10, 'color': "#b4f5a3", 'r': 170, 'cx': 150, 'cy': 600, "stop-opacity": .5},
    {'id': 19, 'color': "#f5a3d6", 'r': 170, 'cx': 600, 'cy': 600, "stop-opacity": .5},
    {'id': 34, 'color': "#D3D3D3", 'r': 300, 'cx': 375, 'cy': 425, "stop-opacity": .5}
];

var root = {type: 'person', id: 16, children: [3, 6, 1, 4, 5, 2]};

var hubs = [
    {type: 'interest', id: 11, children: [12, 14, 15, 16]},
    {type: 'interest', id: 13, children: [21, 22, 23, 24, 25, 26]},
    {type: 'interest', id: 33, children: [23, 43, 53, 63]}
];

var svg = d3.select('svg').attr('width', 900).attr('height', 900);

var viz = new MC.InterestViz({
    hubs: hubs,
    root: root,
    interests: interests,
    people: peeps,
    circles: gradientCircles,
    svg: svg,
    colors: colors
});
    //sames fiel

//$().ready(function () {
//   if($("g.hub").hover()){
//        $("g.hub").hover(function () {
//
//        var tooltip = $(".tooltip").show();
//        var offset = $(this).offset();
//        var width = $(this).outerWidth();
//        $(".tooltip").css({top:offset.top+110, left:offset.left + width + 315}).show();
//    },
//    function () {
//
//        $(".tooltip").fadeOut(function () {
//            $(this).css("marginLeft", "");
//        });
//    });}
//    else if( $("g.interest").hover){
//        $("g.interest").hover(function () {
//            var tooltip = $(".tooltip").show();
//            var offset = $(this).offset();
//            var width = $(this).outerWidth();
//            $(".tooltip").css({top:offset.top+110, left:offset.left + width + 315}).show();
//        }, function () {
//            $(".tooltip").fadeOut(function () {
//                $(this).css("marginLeft", "");
//            });
//        });
//    }
//});


</r:script>
<div></div>
<svg>

</svg>
</body>
</html>