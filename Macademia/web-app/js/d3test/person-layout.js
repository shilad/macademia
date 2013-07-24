/**
 * Created with IntelliJ IDEA.
 * User: research
 * Date: 7/3/13
 * Time: 12:48 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 *
 * Creates a layout integrating interest.js and person.js into one visualization.
 *
 * A person-layout MUST be an object with fields:
 *  interest, clusterMap, person
 *
 * Example usage:
 *
 var people = [
 {"id":15830, "type": 'person', "fid":250588901, "name":"Luther Rea",
     'interestColors': {4 : 'pink', 5 : d3.hsl(180, 0.5, 0.5), 6 : "#ea0", 11 : "#707"},
     'relevance':  {4 : 3.0, 6: 8.3, 11: 1.0},
     "pic":"/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
     "relevance":{"-1":null, "4":1.9539017856121063, "5":1.23, "6":1.04,  "11":1.0947,
         "overall":1.0769508928060532}
 } ];

 var interests = [
 {"id":4, "type": 'interest', "name":"WINNING", "cluster" : 4,'color':'deepPink','cx':590, 'cy':290, 'r': 34} ,
 {"id":5, "type": 'interest', "name":"gum",  "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'black', 'cx':200, 'cy':200, 'r': 34},
 {"id":6, "type":'interest', "name":"shoe", "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'green','cx':50, 'cy': 60, 'r': 34},
 {"id":11, "type":'interest', "name":"ben hillman", "cluster":18,"parentId":"4", "relevance":0.7576502561569214, "roles":[], 'color':'brown','cx':250, 'cy':250, 'r': 34},
 {"id":14, "type": 'interest',"name":"Text mining", "cluster":18, "parentId":"18","relevance":0.7576502561569214, "roles":[], 'color':'black','cx':300, 'cy':300, 'r': 34}];

 var clusterMap = {
        "4": ["5"],
        "5":["6","14"],
        "6":["11"],
        "11":["5"]
    };

 var interest = MC.interest();

 d3.select('svg')
 .datum(interests)
 .call(interest);

 var person = MC.person();

 d3.select('svg')
 .selectAll('g.person')
 .data(people)
 .enter()
 .call(person);

 window.setTimeout(function() {
        var personLayout = MC.personLayout()
                .setPeopleNodes(d3.selectAll('g.person'))
                .setClusterMap(clusterMap)
                .setInterestNodes(d3.selectAll('g.interest'));

        d3.select('svg')
                .selectAll('person-layouts')
                .data([0])
                .enter()
                .call(personLayout);

    }, 1000);
     });

 Available attributes:
 friction: the amount of jiggle the person does before finding its location
 gravity: pulls nodes to the center of the visualization
 peopleNodes: creates the person visualization
 interestNodes: creates the interest node visualization
 clusterMap: decifers weather an interest is a leaf or a hub
 linkDistance: distance of the person form the interests they are attracted to
 charge: the level of repulsion of a person with hub/person/interest

 * @return {Function}
 *
 */
var MC = (window.MC = (window.MC || {}));

MC.personLayout = function () {
    function pl(container) {

        // The d3 view (i.e. SVG elements)
        var interestNodes = pl.getInterestNodes();
        var peopleNodes = pl.getPeopleNodes();


        var linkDis = pl.getOrCallLinkDistance();
        var grav = pl.getOrCallGravity();
        var friction = pl.getOrCallFriction();
        var clusterMap = pl.getOrCallClusterMap();

        // The d3 model (i.e. associative arrays)
        var people = {};
        var interests = {};
        interestNodes.each(function (d) {
            interests[d.id] = d;
        });
        peopleNodes.each(function (d) {
            people[d.id] = d;
        });

        var w = 800,
            h = 800;

        var svg = d3.select('svg');

        var surrogates = {};
        //copies the interest node information--not sure why
        // perhaps this was to avoid radial coordinates
        interestNodes.each(function (d,i) {
            var pos = MC.getTransformedPosition(svg[0][0], this, 0, 0);
            if(d.id){
            surrogates[d.id] = {
                type: 'leaf',
                id: d.id,
                fixed: true,  // interests cannot move
                x: pos.x,
                y: pos.y,
                real: d
            };
            }else if(d[0].id){
                surrogates[d[0].id] = {
                    type: 'hub',
                    id: d[0].id,
                    fixed: true,  // interests cannot move
                    x: pos.x,
                    y: pos.y,
                    real: d
                };
            }
        });

        var getPrimaryInterest = function (p) {
            var maxId = -1;
            var maxRel = -1;
            for (var id in p.relevance) {
                if (id != -1 && id != 'overall' && p.relevance[id] > maxRel) {
                    maxId = id;
                    maxRel = p.relevance[id];
                }
            }
            return maxId;
        }

        //constructing data structure, sets x and y coords,
        peopleNodes.each(function (p, i) {
            p.type = 'person';
            var primary = surrogates[getPrimaryInterest(p)];
            if (primary) {
                p.x = primary.x + (0.5 - Math.random()) * 50;
                p.y = primary.y + (0.5 - Math.random()) * 50;
            }
        });

        // create an edge between each person and the hubs the relate to.
        var links = [];
        peopleNodes.each(function (p, i) {
//            console.log(p)
            $.map(p.relevance, function (r, iid) {
                if (iid != -1 && iid != 'overall') {
//                    console.log(r*r);
                    links.push({
                        source: p,
                        target: surrogates[iid],
                        strength: r * r
                    });
//                    console.log(p);
//                    console.log(surrogates[iid]);
//                    console.log(r*r);
                }
            });
        });

//        console.log(links);
        //get list of values for already made arrays


//           var personNodes = $.map(pl.model.getPeople(),
//            function (v, k) {
//              var p = { real: v };
//                var primary = surrogates[getPrimaryInterest(p)];
//                if (primary) {
//                    p.x = primary.x + (0.5 - Math.random()) * 50;
//                    p.y = primary.y + (0.5 - Math.random()) * 50;
//                }
//                return p;
//            });

//        var clusterMap = pl.model.getClusterMap();


        //places the person in relation to the surrogates
        var force = d3.layout.force()
            .nodes(d3.values(surrogates)
            .concat(d3.values(people)))
            .links(links)
            .size([w, h])
            .linkStrength(function (l) {
                return l.strength / 6;
            })
            .gravity(grav)
            .linkDistance(linkDis)
            .charge(pl.getCharge())
            .friction(friction)
            .start();
        //creates a new g  for each new person
//        var groups = svg.selectAll(".personNode")
//            .data(personNodes)
//            .enter()
//            .append("g")
//            .attr('class', 'personNode');
//        //works with each person as a unit and manipulates
//        groups.append("image")
//            .attr("xlink:href", function (d) {
//                console.log('doing ' + d.name);
//                return d.pic;
//            })
//            .attr("height", "28")
//            .attr("width", "28")
//            .attr("transform", "translate(-14,-14)");
//
//        //fade in
//        svg.style("opacity", 1e-6)
//            .transition()
//            .duration(1000)
//            .style("opacity", 1);
        //keep with in the graph
        var pinch = function (x, min, max) {
            return (x < min) ? min : ((x > max) ? max : x);
        };

        // walk through iterations of convergence to final positions
        force.on("tick", function (e) {

//        // Push different nodes in different directions for clustering.
//        var k = 6 * e.alpha;
//        nodes.forEach(function(o, i) {
//            o.y += i & 1 ? k : -k;
//            o.x += i & 2 ? k : -k;
//        });

            peopleNodes.attr("transform", function (d) {
                d.x = pinch(d.x, 50, 750);
                d.y = pinch(d.y, 50, 750);
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        d3.select("body").on("click", function () {
            peopleNodes.forEach(function (o, i) {
                o.x += (Math.random() - .5) * 40;
                o.y += (Math.random() - .5) * 40;
            });
            force.resume();
        });
    }
                                        //just so I u
    MC.options.register(pl, 'friction', 0.005);
    MC.options.register(pl, 'gravity', 0.005);
    MC.options.register(pl, 'linkDistance', 50);

    MC.options.register(pl, 'peopleNodes', function () {
        throw('no people specified.')
    });
    MC.options.register(pl, 'interestNodes', function () {
        throw('no interests specified.')
    });
    MC.options.register(pl, 'clusterMap', function () {
        throw('no clusterMap specified');
    });
    MC.options.register(pl, 'charge', function(d) {
        //checks to see if it is a hub
        if (d.type == 'hub') {
            return -500;
        } else if (d.type == 'person') {
            return -600;
        } else {
            return -85000;
        }
    });

    return pl;
};