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
    color: black;
    border-radius: 5px;
    padding: 10px 15px;
}


svg {
    position: absolute;
    top: 300px;
    /*height : 90%;*/
    /*width : 90%;*/
}

</style>




<r:script>
var interests = {
    725: {"id": 725, "name": "Online Communities"},
    11114: {"id": 11114, "name": "web2.0"},
    15004: {"id": 15004, "name": "Data Mining"},
    3889: {"id": 3889, "name": "Machine Learning"},
    14304: {"id": 14304, "name": "Jazz"},
    2869: {"id": 2869, "name": "Statistics"},
    2851: {"id": 2851, "name": "Jay-Z"},
    2010: {"id": 2010, "name": "Math"},
    3935: {"id": 3935, "name": "html5"},
    2128: {"id": 2128, "name": "javascript"},
    1134: {"id": 1134, "name": "Web Development"},
    12291: {"id": 12291, "name": "wikis"},
    15276: {"id": 15276, "name": "Web Spam"},
    15292: {"id": 15292, "name": "Semantic Web"},
    3840: {"id": 3840, "name": "Miles Davis"},
    11170: {"id": 11170, "name": "Jazz History"},
    2726: {"id": 2726, "name": "Jazz Performance"},
    15573: {"id": 15573, "name": "Mary Lou Williams"},
    15582: {"id": 15582, "name": "Philosophy of Mathematics"},
    2829: {"id": 2829, "name": "Algebra"},
    738: {"id": 738, "name": "Calculus"}
};
var peeps = {
    2255: {"id": 2255,
        "name": "Luther Rea",
        "pic": "/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
        "relevance": {
            "2128":1.5,

            "overall": 1.0769508928060532},
        "interests": [
            11114,
            2010]},
    3010: {"id": 3010,
        "name": "Donnie Burroughs",
        "pic": "/Macademia/all/image/fake?gender=male&img=00286_940422_fa.png",
        "relevance": {
            "2128": 1.1563,

            "overall": 1.2776578441262245},
        "interests": [
            2128,
            3935,
            2726]},
    228: {"id": 228,
        "name": "Thomas Hanks",
        "pic": "/Macademia/all/image/fake?gender=male&img=00287_940422_fa.png",
        "relevance": {
            "2128": 1.6563,
            "overall": 1.1776578441262245},
        "interests": [
            11114,
            2010]},
    16: {
        "id": 16,
        'name': 'Shilad Sen',
        'pic': '/Macademia/all/image/randomFake?foo',
        'relevance': {
            "2128": 1.1563,
            "overall": 1.1776578441262245},
        'interests': [725, 18599, 3889, 11170, 15292]
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

var root = {type: 'person', id: 16, children: [725, 11114, 15004, 3889, 14304, 2869]};

var hubs = [
    {type: 'interest', id: 3935, children: [2869, 2851, 2010, 1134, 2128]},
    {type: 'interest', id: 2128, children: [12291,15276, 15292, 11170]},
    {type: 'interest', id: 1134, children: [15582, 2726, 15573, 3840]}
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