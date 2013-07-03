macademia.nbrviz.D3 = macademia.nbrviz.D3 || {};

D3Person = Class.extend({
    init : function(params) {
        if (!params.json) {
            throw('params.json is null');
        }

        this.json = params.json;
        this.name = this.json.name;
        this.id = this.json.id;
        this.relevance = this.json.relevance;
        this.count = this.json.count;
        this.pic = this.json.pic;
        this.interests = this.json.interests;
        this.cleanedRelevance = {};
        this.interestColors = params.interestColors;
        for (var k in this.relevance) {
            if (k != -1 && k != 'overall') {
                this.cleanedRelevance[k] = this.relevance[k];
            }
        };
    },

    getPrimaryInterest : function() {
        var maxId = -1;
        var maxRel = -1;
        for (var id in this.relevance) {
            if (id != -1 && id != 'overall' && this.relevance[id] > maxRel) {
                maxId = id;
                maxRel = this.relevance[id];
            }
        };
        return maxId;
    }
});


var D3 = macademia.nbrviz.D3;

D3.init = function() {
//    d3.json('/Macademia/all/explore/interestData/18', D3.processJson);
    D3.processJson(interestJson);
};

D3.processJson = function(json) {
    D3.model = new VizModel(json);
    D3.model.dump();
    macademia.nbrviz.colors.assign(D3.model.getClusterIds());
    D3.initInterests();
    D3.initPeople();
};

D3.initInterests = function() {

    var diameter = 800;
    var clusterMap = D3.model.getClusterMap();
    var tree = d3.layout.tree()
        .sort(null)
        .size([360, diameter / 2 - 50])
        .children(function (i, index) {
            if (i.id == D3.model.getRootId()) {
                var closelyRelated = $.map(
                    D3.model.getRelatedInterests(i.id),
                    function (v, k) { return (v.id in clusterMap) ? null : v
                    });

                var siblings = $.map(clusterMap, function (v, k) {
                    if (k == D3.model.getRootId()) {
                        return null;
                    } else {
                        return D3.model.getInterest(k);
                    }
                });

                $.each(siblings, function (i, s) { s.siblingIndex = i; });
                for (var j = closelyRelated.length-1; j >= 0; j--) {
                    var destIndex = (d3.keys(clusterMap).length - 1) * j / closelyRelated.length;    // TODO: adjust for non-interest-centric graphs
                    console.log('inserting at ' + destIndex);
                    siblings.splice(Math.round(destIndex), 0, closelyRelated[j]);
                }
                return siblings;
            } else if (i.id in clusterMap) {
                // todo: sort to make labeling better
                var children = D3.model.getRelatedInterests(i.id);
                children.sort(function (i1, i2) { return i1.name.length - i2.name.length});
                var odd  = children.filter(function (v, i) { return i % 2 == 1; });
                var even = children.filter(function (v, i) { return i % 2 == 0; });
                even.reverse();
                if (i.siblingIndex % 2 == 0) {
                    return odd.concat(even);
                } else {
                    return even.concat(odd);
                }
            } else {
                return null;
            }
        });
//        .separation(function(a, b) { return 0.5; });
//        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / (a.depth * a.depth); });
    var root = D3.model.getInterest(D3.model.getRootId());
    var nodes = tree.nodes(root);

    // tweak the level one radial layout to push it out
    $.each(nodes, function (i) {
        if (this.depth == 1 && this.siblingIndex >= 0) {
            this.y *= 1.75;
        } else if (this.depth == 1) {
            this.y *= 0.8;
        } else if (this.depth == 2) {
            var rads = this.x / 180 * Math.PI;
            var cornerness = Math.min(
                Math.abs(Math.tan(rads)),
                Math.abs(1.0/Math.tan(rads))
            );
            console.log('cornerness for ' + this.name + ', ' + this.x + ' is ' + cornerness);
            this.y *= Math.sqrt(Math.max(1.2 * cornerness, 1.0));
        }
    });

    var links = tree.links(nodes);

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    var svg = d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var gradient = svg
        .append("radialGradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%")
        .attr("id", "gradient");

    gradient
        .append("stop")
        .attr("offset", "0")
        .attr("stop-color", "#fff")
        .attr("stop-opacity", "0.0");

    gradient
        .append("stop")
        .attr("offset", "1.0")
        .attr("stop-color", "#fff")
        .attr("stop-opacity", "1.0");

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("stroke-dasharray", function(d) {
            if (d.source.id in clusterMap && d.target.id in clusterMap) {
                return "0";
            } else {
                return "2,3";
            }
        })
        .attr("d", function (d) {
            if (d.source.id in clusterMap && d.target.id in clusterMap) {
                return null;
            } else {
                return diagonal(d);
            }
        });

    var node = svg.selectAll(".interestNode")
        .data(nodes)
        .enter().append("g");

    node.filter(function (d) {return d.id in clusterMap;})
        .append("circle")
        .attr("r", 30)
        .style('fill', function (d) { return d3.hsl(d.color * 359, 0.8, 0.8); });

    node.filter(function (d) {return d.id in clusterMap;})
        .append("circle")
        .attr("r", 30)
        .style('fill', 'url(#gradient)');

    node.attr("class", function(d) { return (d.id in clusterMap) ? 'major interestNode' : 'minor interestNode'})
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

    node.append("circle")
        .attr("r", function (d) { return (d.id in clusterMap) ? 15 : 6; })
        .style('stroke', '#bbb')
        .style('fill', function (d) { return d3.hsl(d.color * 359, 0.8, 0.8); });
//        .style("fill", function (d) { return d3.hsl(d.color, 0.5, 0.5);});

    node.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) {
            return 'middle';
            if (d.id in clusterMap) {
                return 'middle';
            } else {
                return d.x < 180 ? "start" : "end";
            }
        })
        .attr("transform", function(d) {
            if (d.id in clusterMap) {
                return 'rotate(' + (90 - d.x) + ')';
            } else {
                return d.x < 180 ? "translate(0,-15)" : "rotate(180)translate(0,-15)";
            }
        })
        .text(function(d) { return d.name; });
};

D3.getTransformedPosition = function(svg, shape, x, y) {
    var matrix = shape.getCTM();

    // transform a point using the transformed matrix
    var position = svg.createSVGPoint();
    position.x = x;
    position.y = y;
    return position.matrixTransform(matrix);
};

D3.initPeople = function() {
    var w = 800,
        h = 800;


    var svg = d3.select('svg');

    var surrogates = {};

    d3.selectAll('.interestNode')
        .each(function (d, i) {
            var pos = D3.getTransformedPosition(svg[0][0], this, 0, 0);
            surrogates[d.id] = {
                id : d.id,
                fixed : true,
                x :pos.x,
                y :pos.y,
                real : d
            };
        });

    var personNodes = $.map(D3.model.getPeople(),
        function (v, k) {
            var p = new D3Person({json : v });
            var primary = surrogates[p.getPrimaryInterest()];
            if (primary) {
                p.x = primary.x + (0.5 - Math.random()) * 50;
                p.y = primary.y + (0.5 - Math.random()) * 50;
            }
            return p;
        });

    var links = [];
    personNodes.forEach(function (p) {
        $.map(p.relevance, function (r, iid) {
            if (iid != -1 && iid != 'overall') {
                links.push({
                    source : p,
                    target : surrogates[iid],
                    strength : r * r
                });
            }
        });
    });
    var clusterMap = D3.model.getClusterMap();

    var force = d3.layout.force()
        .nodes(d3.values(surrogates).concat(personNodes))
        .links(links)
        .size([w, h])
        .linkStrength(function (l) { return l.strength / 6; })
        .gravity(0.005)
        .linkDistance(50)
        .charge(function (d) {
            if (d.id in clusterMap) {
                return -600;
            } else if (d instanceof D3Person) {
                return -600;
            } else {
                return -50;
            }
        })
        .friction(0.8)
        .start();

    var groups = svg.selectAll(".personNode")
        .data(personNodes)
        .enter()
        .append("g")
        .attr('class', 'personNode');

    groups.append("image")
        .attr("xlink:href", function (d) {console.log('doing ' + d.name); return d.pic;})
        .attr("height", "28")
        .attr("width", "28")
        .attr("transform", "translate(-14,-14)");

    var arc = d3.svg.arc()
        .innerRadius(14)
        .outerRadius(22);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    groups.append("g")
        .selectAll("path")
        .data(function (d) {
            return pie(d3.entries(d.cleanedRelevance));
        })
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("stroke", "#888")
        .attr("fill", function (d) {
            var i = D3.model.getInterest(d.data.key);
            return d3.hsl(i.color * 359, 0.8, 0.8);
        });

    groups.append("text")
        .attr("dy", "30px")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.name; });

    svg.style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    var pinch = function(x, min, max) {
        return (x < min) ? min : ((x > max) ? max : x);
    };

    force.on("tick", function(e) {

//        // Push different nodes in different directions for clustering.
//        var k = 6 * e.alpha;
//        nodes.forEach(function(o, i) {
//            o.y += i & 1 ? k : -k;
//            o.x += i & 2 ? k : -k;
//        });

        groups.attr("transform", function(d) {
            d.x = pinch(d.x, 50, 750);
            d.y = pinch(d.y, 50, 750);
            return "translate(" + d.x + "," + d.y + ")";
        });
    });

    d3.select("body").on("click", function() {
        personNodes.forEach(function(o, i) {
            o.x += (Math.random() - .5) * 40;
            o.y += (Math.random() - .5) * 40;
        });
        force.resume();
    });

};



var interestJson = {"people":{
    "15830":{"id":15830, "fid":250588901, "name":"Luther Rea", "pic":"/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png", "relevance":{"-1":null, "976":1.1539017856121063, "24":1, "overall":1.0769508928060532}, "count":{"-1":15, "976":2, "24":1, "overall":3}, "interests":[10262, 11870, 1438, 15829, 462, 3869, 1476, 15827, 15826, 15836, 15833, 16179, 15832, 15835, 15834, 10987, 15828, 24]}, "16":{"id":16, "fid":257, "name":"Donnie Burroughs", "pic":"/Macademia/all/image/fake?gender=male&img=00286_940422_fa.png", "relevance":{"-1":null, "18":1.555315688252449, "24":1, "overall":1.2776578441262245}, "count":{"-1":13, "18":3, "24":1, "overall":4}, "interests":[1223, 15, 17, 21, 20, 23, 22, 25, 601, 27, 1208, 1110, 30, 18, 19, 28, 24]}, "2691":{"id":2691, "fid":7241482, "name":"Diana Brooks", "pic":"/Macademia/all/image/fake?gender=female&img=00633_940928_fa.png", "relevance":{"18":1.3140089064836502, "-1":null, "976":1, "overall":1.157004453241825}, "count":{"18":3, "-1":5, "976":1, "overall":4}, "interests":[2687, 19, 227, 2693, 2692, 2694, 1224, 2688, 976]}, "15680":{"id":15680, "fid":245862401, "name":"Ed Sanborn", "pic":"/Macademia/all/image/fake?gender=male&img=00798_941205_fa.png", "relevance":{"18":1.7103700954467058, "-1":null, "overall":0.8551850477233529}, "count":{"18":6, "-1":1, "overall":6}, "interests":[18, 15677, 15679, 28, 15675, 15678, 15676]}, "17198":{"id":17198, "fid":295771205, "name":"Emery Etheridge", "pic":"/Macademia/all/image/fake?gender=male&img=00460_940422_fa.png", "relevance":{"18":1.3189659714698792, "976":1.5695229321718216, "-1":null, "24":1, "overall":1.9442444518208504}, "count":{"18":2, "976":3, "-1":8, "24":1, "overall":6}, "interests":[18, 1221, 976, 402, 16597, 1438, 462, 1207, 17193, 17194, 17195, 63, 17196, 24]}, "12104":{"id":12104, "fid":146506817, "name":"Mario Louis", "pic":"/Macademia/all/image/fake?gender=male&img=00155_940128_fa.png", "relevance":{"18":0.6376854777336121, "24":1, "976":1.604827418923378, "-1":null, "1501":0.661139726638794, "overall":1.951826311647892}, "count":{"18":1, "24":1, "976":3, "-1":2, "1501":1, "overall":6}, "interests":[295, 24, 976, 12103, 12102, 12099, 12101, 12100]}, "443":{"id":443, "fid":196250, "name":"Alana Seals", "pic":"/Macademia/all/image/fake?gender=female&img=00071_931230_fa.png", "relevance":{"-1":null, "24":1.5525153130292892, "18":0.6376854777336121, "1501":0.6479836702346802, "overall":1.4190922304987907}, "count":{"-1":15, "24":3, "18":1, "1501":1, "overall":5}, "interests":[444, 445, 446, 447, 948, 946, 947, 456, 455, 454, 453, 451, 450, 449, 448, 24, 457, 145, 295, 452]}, "11412":{"id":11412, "fid":130233745, "name":"Jame Hyatt", "pic":"/Macademia/all/image/fake?gender=male&img=00627_940928_fa.png", "relevance":{"-1":null, "1501":1.2077298909425735, "24":1, "overall":1.1038649454712868}, "count":{"-1":2, "1501":3, "24":1, "overall":4}, "interests":[11410, 11411, 245, 1079, 2375, 24]}, "12159":{"id":12159, "fid":147841282, "name":"Mavis Storey", "pic":"/Macademia/all/image/fake?gender=female&img=00791_941205_fa.png", "relevance":{"-1":null, "24":1.609576590359211, "overall":0.8047882951796055}, "count":{"-1":7, "24":4, "overall":4}, "interests":[204, 2080, 156, 12158, 78, 846, 1895, 24, 955, 44, 1281]}, "15869":{"id":15869, "fid":251825162, "name":"Gabrielle Tapia", "pic":"/Macademia/all/image/fake?gender=female&img=00112_931230_fa.png", "relevance":{"-1":null, "24":1.3015805780887604, "1501":0.6328731179237366, "976":0.6147075891494751, "18":0.6469489932060242, "overall":1.598055139183998}, "count":{"-1":5, "24":2, "1501":1, "976":1, "18":1, "overall":5}, "interests":[15863, 2541, 15868, 15867, 15866, 24, 1281, 890, 15865, 15864]}, "1076":{"id":1076, "fid":1157777, "name":"Melvin Strickland", "pic":"/Macademia/all/image/fake?gender=male&img=00004_930831_fa.png", "relevance":{"24":1.491046518087387, "1501":1.1455507427453995, "-1":null, "18":0.9407278299331665, "overall":1.7886625453829765}, "count":{"24":3, "1501":3, "-1":4, "18":2, "overall":8}, "interests":[24, 924, 1077, 293, 1079, 1073, 447, 43, 1072, 1078, 295, 1074]}, "10961":{"id":10961, "fid":120143522, "name":"Amber Broome", "pic":"/Macademia/all/image/fake?gender=female&img=00399_940422_fa.png", "relevance":{"-1":null, "976":1.7213415876030922, "1501":0.6577069759368896, "overall":1.189524281769991}, "count":{"-1":8, "976":5, "1501":1, "overall":6}, "interests":[10263, 1676, 10960, 2151, 10954, 10953, 10958, 10956, 976, 402, 10955, 2010, 10959, 10957]}, "17798":{"id":17798, "fid":316768805, "name":"Clay Warner", "pic":"/Macademia/all/image/fake?gender=male&img=00713_941201_fa.png", "relevance":{"1501":0.6564915776252747, "976":1.4195661544799805, "18":0.6469489932060242, "overall":1.3615033626556396}, "count":{"1501":1, "976":2, "18":1, "overall":4}, "interests":[223, 976, 4018, 15864]}, "17537":{"id":17537, "fid":307546370, "name":"Lillie Morrow", "pic":"/Macademia/all/image/fake?gender=female&img=00317_940422_fa.png", "relevance":{"1501":0.6564915776252747, "976":1.4195661544799805, "18":0.6469489932060242, "overall":1.3615033626556396}, "count":{"1501":1, "976":2, "18":1, "overall":4}, "interests":[223, 976, 4018, 15864]}, "4367":{"id":4367, "fid":19070690, "name":"Sarah Mayfield", "pic":"/Macademia/all/image/fake?gender=female&img=00393_940422_fa.png", "relevance":{"1501":1.5325594991445541, "-1":null, "overall":0.7662797495722771}, "count":{"1501":3, "-1":2, "overall":3}, "interests":[1501, 243, 223, 15117, 15116]}, "18318":{"id":18318, "fid":335549125, "name":"Herschel Garland", "pic":"/Macademia/all/image/fake?gender=male&img=00064_931230_fa.png", "relevance":{"1501":1.7000646516680717, "-1":null, "24":0.683821976184845, "976":1.5629120469093323, "overall":1.9733993373811245}, "count":{"1501":5, "-1":3, "24":1, "976":3, "overall":9}, "interests":[1501, 2331, 18316, 223, 984, 1445, 18317, 319, 320, 976, 402, 318]}, "10493":{"id":10493, "fid":110103050, "name":"Sonja Lord", "pic":"/Macademia/all/image/fake?gender=female&img=00609_940928_fa.png", "relevance":{"-1":null, "1501":0.9457209408283234, "18":1.3581135645508766, "overall":1.1519172526896}, "count":{"-1":3, "1501":2, "18":5, "overall":7}, "interests":[10492, 10490, 10491, 3130, 10487, 10486, 227, 323, 10488, 10489]}, "18134":{"id":18134, "fid":328841957, "name":"Carmelo Looney", "pic":"/Macademia/all/image/fake?gender=male&img=00230_940128_fa.png", "relevance":{"24":1.4297183435410261, "-1":null, "18":1.0485795140266418, "overall":1.239148928783834}, "count":{"24":6, "-1":7, "18":2, "overall":8}, "interests":[18131, 18133, 10779, 18130, 18132, 18125, 18127, 1124, 18126, 18431, 287, 18129, 11334, 18128, 977]}, "359":{"id":359, "fid":128882, "name":"Whitney Schaeffer", "pic":"/Macademia/all/image/fake?gender=female&img=00479_940519_fa.png", "relevance":{"24":1.2681848481297493, "18":0.7336868643760681, "976":0.7719559669494629, "-1":null, "overall":1.3869138397276402}, "count":{"24":4, "18":1, "976":1, "-1":2, "overall":6}, "interests":[320, 924, 923, 358, 925, 360, 361, 362]}, "18300":{"id":18300, "fid":334890001, "name":"Thomas Himes", "pic":"/Macademia/all/image/fake?gender=male&img=00726_941201_fa.png", "relevance":{"976":1.7860518456436694, "-1":null, "overall":0.8930259228218347}, "count":{"976":8, "-1":2, "overall":8}, "interests":[976, 402, 12333, 1508, 18294, 2010, 18298, 18297, 18296, 18295]}}, "interests":{"18":{"id":18, "name":"data mining", "cluster":18, "relevance":1, "roles":[]}, "2687":{"id":2687, "name":"Text mining", "cluster":18, "relevance":0.7576502561569214, "roles":[]}, "15677":{"id":15677, "name":" text analytics", "cluster":18, "relevance":0.7576502561569214, "roles":[]}, "19":{"id":19, "name":"machine learning", "cluster":18, "relevance":0.7538068890571594, "roles":[]}, "925":{"id":925, "name":" regression", "cluster":18, "relevance":0.7336868643760681, "roles":[]}, "15679":{"id":15679, "name":" information visualization", "cluster":18, "relevance":0.724751889705658, "roles":[]}, "227":{"id":227, "name":"artificial intelligence", "cluster":18, "relevance":0.7178208231925964, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.7178208231925964}
]},
    "10486":{"id":10486, "name":"AI", "cluster":18, "relevance":0.7178208231925964, "roles":[]}, "28":{"id":28, "name":"recommender systems", "cluster":18, "relevance":0.7136489748954773, "roles":[]}, "457":{"id":457, "name":"econometrics", "cluster":24, "relevance":0.7921417355537415, "roles":[]}, "18128":{"id":18128, "name":" Linear Mixed-Effects Regression", "cluster":18, "relevance":0.7027758955955505, "roles":[]}, "977":{"id":977, "name":" data visualization", "cluster":18, "relevance":0.6916072368621826, "roles":[]}, "16204":{"id":16204, "name":" big data", "cluster":18, "relevance":0.6904739141464233, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.6904739141464233}
]},
    "15675":{"id":15675, "name":"collaborative filtering", "cluster":18, "relevance":0.6650980710983276, "roles":[]}, "323":{"id":323, "name":"algorithms", "cluster":18, "relevance":0.651515007019043, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.651515007019043}
]}, "15864":{"id":15864, "name":" computational modeling", "cluster":18, "relevance":0.6469489932060242, "roles":[]}, "1443":{"id":1443, "name":" game theory", "cluster":18, "relevance":0.6441075205802917, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.6441075205802917}
]}, "10488":{"id":10488, "name":"genetic programming", "cluster":18, "relevance":0.6382604241371155, "roles":[]}, "1221":{"id":1221, "name":" R", "cluster":18, "relevance":0.6379319429397583, "roles":[]}, "295":{"id":295, "name":"mathematical modeling", "cluster":18, "relevance":0.6376854777336121, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.6376854777336121}
]}, "15678":{"id":15678, "name":" visual analytics", "cluster":18, "relevance":0.6266317963600159, "roles":[]}, "307":{"id":307, "name":"quantitative methods", "cluster":24, "relevance":0.8005675077438354, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.8005675077438354}
]}, "923":{"id":923, "name":" mathematical statistics", "cluster":24, "relevance":0.6611890196800232, "roles":[]}, "1073":{"id":1073, "name":" computational science", "cluster":1501, "relevance":0.6289969086647034, "roles":[]}, "24":{"id":24, "name":"statistics", "cluster":24, "relevance":1, "roles":[]}, "711":{"id":711, "name":"GIS", "cluster":18, "relevance":0.6228541731834412, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.6228541731834412}
]}, "10489":{"id":10489, "name":"genetic algorithms", "cluster":18, "relevance":0.6195363998413086, "roles":[]}, "4018":{"id":4018, "name":"computational biology", "cluster":976, "relevance":0.8391323089599609, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.8391323089599609}
]}, "12103":{"id":12103, "name":"Molecular biology techniques", "cluster":976, "relevance":0.8391323089599609, "roles":[]}, "924":{"id":924, "name":" statistical modeling", "cluster":24, "relevance":0.6751334071159363, "roles":[]}, "1074":{"id":1074, "name":" numerical methods", "cluster":18, "relevance":0.6060847043991089, "roles":[]}, "18130":{"id":18130, "name":" Longitudinal Research Methods", "cluster":24, "relevance":0.636782169342041, "roles":[]}, "3590":{"id":3590, "name":"Information Technology in Education", "cluster":18, "relevance":0.6017322540283203, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":18, "relevance":0.6017322540283203}
]}, "18131":{"id":18131, "name":" Qualitative Research", "cluster":24, "relevance":0.7961986064910889, "roles":[]}, "10779":{"id":10779, "name":"programming and statistics", "cluster":24, "relevance":0.6621909141540527, "roles":[]}, "1224":{"id":1224, "name":" natural language processing", "cluster":1224, "relevance":0, "roles":[]}, "293":{"id":293, "name":"applied mathematics", "cluster":1501, "relevance":0.6638990640640259, "roles":[]}, "1445":{"id":1445, "name":" complexity", "cluster":1445, "relevance":0, "roles":[]}, "976":{"id":976, "name":"bioinformatics", "cluster":976, "relevance":1, "roles":[]}, "17":{"id":17, "name":"social networking", "cluster":17, "relevance":0, "roles":[]}, "12101":{"id":12101, "name":"computer programming", "cluster":12101, "relevance":0, "roles":[]}, "955":{"id":955, "name":" Research methods", "cluster":24, "relevance":0.7533798813819885, "roles":[]}, "30":{"id":30, "name":"tagging", "cluster":30, "relevance":0, "roles":[]}, "18133":{"id":18133, "name":" Focus Group", "cluster":24, "relevance":0.6624372601509094, "roles":[]}, "10487":{"id":10487, "name":"Theory of computations", "cluster":1501, "relevance":0.6191914677619934, "roles":[]}, "1077":{"id":1077, "name":" causal inference", "cluster":24, "relevance":0.6139192581176758, "roles":[]}, "10490":{"id":10490, "name":"Evolutionary programming", "cluster":10490, "relevance":0, "roles":[]}, "63":{"id":63, "name":"information technology", "cluster":63, "relevance":0, "roles":[]}, "3130":{"id":3130, "name":" formal languages", "cluster":1501, "relevance":0.6361252069473267, "roles":[]}, "2331":{"id":2331, "name":" Logic", "cluster":1501, "relevance":0.8037210702896118, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.8037210702896118}
]}, "318":{"id":318, "name":"graph theory", "cluster":976, "relevance":0.6039330959320068, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.6039330959320068}
]}, "358":{"id":358, "name":"survival analysis", "cluster":24, "relevance":0.6519913077354431, "roles":[]}, "11870":{"id":11870, "name":"Earth system science", "cluster":11870, "relevance":0, "roles":[]}, "15676":{"id":15676, "name":" e-discovery", "cluster":15676, "relevance":0, "roles":[]}, "1501":{"id":1501, "name":" mathematics", "cluster":1501, "relevance":1, "roles":[]}, "984":{"id":984, "name":" discrete mathematics", "cluster":1501, "relevance":0.6357474327087402, "roles":[]}, "10492":{"id":10492, "name":"grammatical evolution", "cluster":10492, "relevance":0, "roles":[]}, "1208":{"id":1208, "name":" human-computer interaction", "cluster":1208, "relevance":0, "roles":[]}, "18316":{"id":18316, "name":" foundations of mathematics", "cluster":1501, "relevance":0.705633819103241, "roles":[]}, "2692":{"id":2692, "name":"computer assisted language learning", "cluster":2692, "relevance":0, "roles":[]}, "223":{"id":223, "name":"combinatorics", "cluster":1501, "relevance":0.6564915776252747, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.6564915776252747}
]}, "1072":{"id":1072, "name":" epidemiology", "cluster":1072, "relevance":0, "roles":[]}, "758":{"id":758, "name":"ethnography", "cluster":24, "relevance":0.7162275910377502, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.7162275910377502}
]}, "320":{"id":320, "name":"probability", "cluster":24, "relevance":0.683821976184845, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.683821976184845}
]}, "2178":{"id":2178, "name":" cognitive psychology", "cluster":24, "relevance":0.6701075434684753, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.6701075434684753}
]}, "44":{"id":44, "name":"community psychology", "cluster":24, "relevance":0.6299660205841064, "roles":[]}, "145":{"id":145, "name":"economics", "cluster":24, "relevance":0.6257777810096741, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.6257777810096741}
]}, "773":{"id":773, "name":"archaeology", "cluster":24, "relevance":0.6170234680175781, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.6170234680175781}
]}, "18132":{"id":18132, "name":" Interview", "cluster":24, "relevance":0.6111927628517151, "roles":[]}, "3281":{"id":3281, "name":"Competitive Strategy", "cluster":24, "relevance":0.6084169745445251, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":24, "relevance":0.6084169745445251}
]}, "18125":{"id":18125, "name":"Educational Research", "cluster":24, "relevance":0.606593906879425, "roles":[]}, "1281":{"id":1281, "name":" cross-cultural psychology", "cluster":24, "relevance":0.6031611561775208, "roles":[]}, "402":{"id":402, "name":"genomics", "cluster":976, "relevance":0.8238575458526611, "roles":[]}, "10987":{"id":10987, "name":"phylogenetics", "cluster":976, "relevance":0.7744689583778381, "roles":[]}, "12333":{"id":12333, "name":"DNA", "cluster":976, "relevance":0.7732700109481812, "roles":[]}, "360":{"id":360, "name":"biostatistics", "cluster":976, "relevance":0.7719559669494629, "roles":[]}, "1508":{"id":1508, "name":" biology", "cluster":976, "relevance":0.7658953666687012, "roles":[]}, "3805":{"id":3805, "name":"Biological Sciences", "cluster":976, "relevance":0.7658953666687012, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.7658953666687012}
]}, "2126":{"id":2126, "name":"molecular biology", "cluster":976, "relevance":0.7630538940429688, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.7630538940429688}
]}, "18294":{"id":18294, "name":" Cell and Molecular Biology", "cluster":976, "relevance":0.7630538940429688, "roles":[]}, "15828":{"id":15828, "name":" theoretical biology", "cluster":976, "relevance":0.7588656544685364, "roles":[]}, "12102":{"id":12102, "name":"Molecular genetic and genomic analysis of host pathogen interactions", "cluster":976, "relevance":0.7410450577735901, "roles":[]}, "10955":{"id":10955, "name":"bioinformatics and therapeutics", "cluster":976, "relevance":0.7142238020896912, "roles":[]}, "2010":{"id":2010, "name":" genetics", "cluster":976, "relevance":0.7008706331253052, "roles":[]}, "10959":{"id":10959, "name":"cell physiology", "cluster":976, "relevance":0.691968560218811, "roles":[]}, "18298":{"id":18298, "name":" Transposable elements", "cluster":976, "relevance":0.6781719923019409, "roles":[]}, "407":{"id":407, "name":"cell biology", "cluster":976, "relevance":0.6759710907936096, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.6759710907936096}
]}, "738":{"id":738, "name":"Biochemistry", "cluster":976, "relevance":0.651219367980957, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.651219367980957}
]}, "2710":{"id":2710, "name":"Developmental Biology", "cluster":976, "relevance":0.6348605155944824, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":976, "relevance":0.6348605155944824}
]}, "16597":{"id":16597, "name":" viruses", "cluster":976, "relevance":0.6303766369819641, "roles":[]}, "18297":{"id":18297, "name":" DNA damage and repair", "cluster":976, "relevance":0.6245294213294983, "roles":[]}, "15865":{"id":15865, "name":" bio-markers", "cluster":976, "relevance":0.6147075891494751, "roles":[]}, "243":{"id":243, "name":"algebra", "cluster":1501, "relevance":0.736873209476471, "roles":[]}, "245":{"id":245, "name":"geometry", "cluster":1501, "relevance":0.7313545942306519, "roles":[]}, "2581":{"id":2581, "name":" math education", "cluster":1501, "relevance":0.7265915274620056, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.7265915274620056}
]}, "12100":{"id":12100, "name":"intro to biology", "cluster":1501, "relevance":0.661139726638794, "roles":[]}, "10957":{"id":10957, "name":"Physiology", "cluster":1501, "relevance":0.6577069759368896, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.6577069759368896}
]}, "1079":{"id":1079, "name":" calculus", "cluster":1501, "relevance":0.6488049030303955, "roles":[]}, "452":{"id":452, "name":"energy", "cluster":1501, "relevance":0.6479836702346802, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.6479836702346802}
]}, "74":{"id":74, "name":"anthropology", "cluster":1501, "relevance":0.6442553400993347, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"}, "parentId":1501, "relevance":0.6442553400993347}
]},
    "890":{"id":890, "name":"psychology", "cluster":1501, "relevance":0.6328731179237366, "roles":[
    {"role":{"enumType":"org.macademia.nbrviz.InterestRole$RoleType", "name":"CHILD_OF_RELATED"},
        "parentId":1501, "relevance":0.6328731179237366}

]},
    "2375":{"id":2375, "name":"algebraic geometry", "cluster":1501, "relevance":0.6078913807868958, "roles":[]}, "21":{"id":21,
    "name":"politics", "cluster":21, "relevance":0, "roles":[]}, "1438":{"id":1438,
    "name":" Evolution", "cluster":1438, "relevance":0, "roles":[]}, "11411":{"id":11411,
    "name":"modern algebra", "cluster":11411, "relevance":0, "roles":[]}, "946":{"id":946,
    "name":" microeconomics", "cluster":946, "relevance":0, "roles":[]}, "948":{"id":948,
    "name":" urban economics", "cluster":-1, "relevance":-1, "roles":[]}, "462":{"id":462,
    "name":"ecology", "cluster":-1, "relevance":-1, "roles":[]}, "10262":{"id":10262,
    "name":"Community Ecology", "cluster":-1, "relevance":-1, "roles":[]}, "15829":{"id":15829,
    "name":" quantitative ecology", "cluster":-1, "relevance":-1, "roles":[]}, "3869":{"id":3869,
    "name":"science writing", "cluster":-1, "relevance":-1, "roles":[]}, "1476":{"id":1476,
    "name":" biogeography", "cluster":-1, "relevance":-1, "roles":[]}, "15827":{"id":15827,
    "name":" macroecology", "cluster":-1, "relevance":-1, "roles":[]}, "15826":{"id":15826,
    "name":" scaling", "cluster":-1, "relevance":-1, "roles":[]}, "15836":{"id":15836,
    "name":" caterpillars", "cluster":-1, "relevance":-1, "roles":[]}, "15833":{"id":15833,
    "name":" trees", "cluster":-1, "relevance":-1, "roles":[]}, "16179":{"id":16179,
    "name":" public understanding of science", "cluster":-1, "relevance":-1, "roles":[]}, "15832":{"id":15832,
    "name":" plants", "cluster":-1, "relevance":-1, "roles":[]}, "15835":{"id":15835,
    "name":" lepidoptera", "cluster":-1, "relevance":-1, "roles":[]}, "15834":{"id":15834,
    "name":" eastern deciduous forest", "cluster":-1, "relevance":-1, "roles":[]}, "1223":{"id":1223,
    "name":" saxophone", "cluster":-1, "relevance":-1, "roles":[]}, "15":{"id":15,
    "name":"online communities", "cluster":-1, "relevance":-1, "roles":[]}, "20":{"id":20,
    "name":"web2.0", "cluster":-1, "relevance":-1, "roles":[]}, "23":{"id":23,
    "name":"group psychology", "cluster":-1, "relevance":-1, "roles":[]}, "22":{"id":22,
    "name":"social psychology", "cluster":-1, "relevance":-1, "roles":[]}, "25":{"id":25,
    "name":"collaborative computing", "cluster":-1, "relevance":-1, "roles":[]}, "601":{"id":601,
    "name":"Jazz", "cluster":-1, "relevance":-1, "roles":[]}, "27":{"id":27,
    "name":"online contributions", "cluster":-1, "relevance":-1, "roles":[]}, "1110":{"id":1110,
    "name":" balkanization", "cluster":-1, "relevance":-1, "roles":[]}, "319":{"id":319,
    "name":"networks", "cluster":-1, "relevance":-1, "roles":[]}, "1207":{"id":1207,
    "name":" computer science", "cluster":-1, "relevance":-1, "roles":[]}, "2693":{"id":2693,
    "name":" Japanese", "cluster":-1, "relevance":-1, "roles":[]}, "2694":{"id":2694,
    "name":" Chinese", "cluster":-1, "relevance":-1, "roles":[]}, "2688":{"id":2688,
    "name":" second language learning", "cluster":-1, "relevance":-1, "roles":[]}, "17193":{"id":17193,
    "name":"\nmicroRNA", "cluster":-1, "relevance":-1, "roles":[]}, "17194":{"id":17194,
    "name":"\nliver disease", "cluster":-1, "relevance":-1, "roles":[]}, "17195":{"id":17195,
    "name":"\nhepatitis", "cluster":-1, "relevance":-1, "roles":[]}, "17196":{"id":17196,
    "name":"\nJava", "cluster":-1, "relevance":-1, "roles":[]}, "12099":{"id":12099,
    "name":"genetics/geonomics", "cluster":-1, "relevance":-1, "roles":[]}, "444":{"id":444,
    "name":"environmental economics", "cluster":-1, "relevance":-1, "roles":[]}, "445":{"id":445,
    "name":"public finance", "cluster":-1, "relevance":-1, "roles":[]}, "446":{"id":446,
    "name":"environmental policy", "cluster":-1, "relevance":-1, "roles":[]}, "447":{"id":447,
    "name":"public policy", "cluster":-1, "relevance":-1, "roles":[]}, "947":{"id":947,
    "name":" principles of economics", "cluster":-1, "relevance":-1, "roles":[]}, "456":{"id":456,
    "name":"pollution control", "cluster":-1, "relevance":-1, "roles":[]}, "455":{"id":455,
    "name":"automobiles", "cluster":-1, "relevance":-1, "roles":[]}, "454":{"id":454,
    "name":"gasoline", "cluster":-1, "relevance":-1, "roles":[]}, "453":{"id":453,
    "name":"natural resources", "cluster":-1, "relevance":-1, "roles":[]}, "451":{"id":451,
    "name":"climate change", "cluster":-1, "relevance":-1, "roles":[]}, "450":{"id":450,
    "name":"optimal tax policy", "cluster":-1, "relevance":-1, "roles":[]}, "449":{"id":449,
    "name":"market failure", "cluster":-1, "relevance":-1, "roles":[]}, "448":{"id":448,
    "name":"externalities", "cluster":-1, "relevance":-1, "roles":[]}, "11410":{"id":11410,
    "name":"Noncommutative ring theory", "cluster":-1, "relevance":-1, "roles":[]}, "204":{"id":204,
    "name":"feminist theory", "cluster":-1, "relevance":-1, "roles":[]}, "2080":{"id":2080,
    "name":" violence against women", "cluster":-1, "relevance":-1, "roles":[]}, "156":{"id":156,
    "name":"women", "cluster":-1, "relevance":-1, "roles":[]}, "12158":{"id":12158,
    "name":" Women in Poverty", "cluster":-1, "relevance":-1, "roles":[]}, "78":{"id":78,
    "name":"gender", "cluster":-1, "relevance":-1, "roles":[]}, "846":{"id":846,
    "name":"social identities", "cluster":-1, "relevance":-1, "roles":[]}, "1895":{"id":1895,
    "name":" social change", "cluster":-1, "relevance":-1, "roles":[]}, "15863":{"id":15863,
    "name":"adolescent development", "cluster":-1, "relevance":-1, "roles":[]}, "2541":{"id":2541,
    "name":" developmental psychology", "cluster":-1, "relevance":-1, "roles":[]}, "15868":{"id":15868,
    "name":" sexual violence prevention", "cluster":-1, "relevance":-1, "roles":[]}, "15867":{"id":15867,
    "name":" parental monitoring", "cluster":-1, "relevance":-1, "roles":[]}, "15866":{"id":15866,
    "name":" parenting", "cluster":-1, "relevance":-1, "roles":[]}, "43":{"id":43,
    "name":"public health", "cluster":-1, "relevance":-1, "roles":[]}, "1078":{"id":1078,
    "name":" quantitative literacy", "cluster":-1, "relevance":-1, "roles":[]}, "10263":{"id":10263,
    "name":"Parasitology", "cluster":-1, "relevance":-1, "roles":[]}, "1676":{"id":1676,
    "name":" malaria", "cluster":-1, "relevance":-1, "roles":[]}, "10960":{"id":10960,
    "name":"Malaria Genomics", "cluster":-1, "relevance":-1, "roles":[]}, "2151":{"id":2151,
    "name":" microbiology.", "cluster":-1, "relevance":-1, "roles":[]}, "10954":{"id":10954,
    "name":"infectious diseases", "cluster":-1, "relevance":-1, "roles":[]}, "10953":{"id":10953,
    "name":"therapeutics", "cluster":-1, "relevance":-1, "roles":[]}, "10958":{"id":10958,
    "name":"Molecular Parasitology", "cluster":-1, "relevance":-1, "roles":[]}, "10956":{"id":10956,
    "name":"Immunology", "cluster":-1, "relevance":-1, "roles":[]}, "287":{"id":287,
    "name":"assessment", "cluster":-1, "relevance":-1, "roles":[]}, "11334":{"id":11334,
    "name":"digital humanities", "cluster":-1, "relevance":-1, "roles":[]}, "1124":{"id":1124,
    "name":"IRB", "cluster":-1, "relevance":-1, "roles":[]}, "15117":{"id":15117,
    "name":" Galois theory", "cluster":-1, "relevance":-1, "roles":[]}, "15116":{"id":15116,
    "name":"absolute Galois groups", "cluster":-1, "relevance":-1, "roles":[]}, "18317":{"id":18317,
    "name":" Markov chains", "cluster":-1, "relevance":-1, "roles":[]}, "10491":{"id":10491,
    "name":"automata", "cluster":-1, "relevance":-1, "roles":[]}, "18127":{"id":18127,
    "name":" Viz", "cluster":-1, "relevance":-1, "roles":[]}, "18126":{"id":18126,
    "name":" Educational Uses of Technologies", "cluster":-1, "relevance":-1, "roles":[]}, "18431":{"id":18431,
    "name":" cultural capital", "cluster":-1, "relevance":-1, "roles":[]}, "18129":{"id":18129,
    "name":" LMER", "cluster":-1, "relevance":-1, "roles":[]}, "361":{"id":361,
    "name":"election audits", "cluster":-1, "relevance":-1, "roles":[]}, "362":{"id":362,
    "name":"sports statistics.", "cluster":-1, "relevance":-1, "roles":[]}, "18296":{"id":18296,
    "name":" Proteasome", "cluster":-1, "relevance":-1, "roles":[]}, "18295":{"id":18295,
    "name":" Drosophila", "cluster":-1, "relevance":-1, "roles":[]}}, "rootId":18, "rootClass":"interest",
    "clusterMap":{"18":[1443, 16204, 323, 295, 3590, 227, 711],
    "24":[307, 773, 3281, 320, 145, 2178, 758],
    "976":[4018, 738, 2710, 2126, 407, 3805, 318],
    "1501":[2581, 223, 10957, 2331, 452, 890, 74]}};
D3.init();


