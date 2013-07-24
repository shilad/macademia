/**
 * Created with IntelliJ IDEA.
 * User: research
 * Date: 7/3/13
 * Time: 12:48 PM
 * To change this template use File | Settings | File Templates.
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
            surrogates[d.id] = {
                type: (d.id in clusterMap) ? 'hub' : 'leaf',
                id: d.id,
                fixed: true,  // interests cannot move
                x: pos.x,
                y: pos.y,
                real: d
            };
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
//                console.log(surrogates[iid]);
                if (iid != -1 && iid != 'overall') {
                    links.push({
                        source: p,
                        target: surrogates[iid],
                        strength: r * r
                    });
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
            .nodes(d3.values(surrogates).concat(d3.values(people)))
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
    MC.options.register(pl, 'friction', 0.8);
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
            return -50;
        } else if (d.type == 'person') {
            return -600;
        } else {
            return -50;
        }
    });

    return pl;
};