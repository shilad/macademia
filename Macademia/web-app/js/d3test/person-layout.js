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

        var w = d3.select("g.viz").attr('width'); //bound for gravity field
        var h = d3.select("g.viz").attr('height');

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

//        console.log(surrogates);

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
            $.map(p.relevance, function (r, iid) {
                if (iid != -1 && iid != 'overall') {
                    links.push({
                        source: p,
                        target: surrogates[iid],
                        strength: r * r
                    });
                    links.push({
                        source: surrogates[iid],
                        target: p,
                        strength: r * r
                    });
                }
            });
        });
//

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

        var q = d3.geom.quadtree (d3.values(surrogates)
            .concat(d3.values(people)));
        console.log(q)

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

        //Find the locations of the hubs on the page
        var findHubLocations = function(){
            var hubLocs = {};
            for(var i in surrogates){
                if(surrogates[i].type=='hub'){
                    hubLocs[surrogates[i].id]={id:surrogates[i].id,x:surrogates[i].x,y:surrogates[i].y};
                }
            }
            return hubLocs;
        };

        //Find the slope of the line formed by the hub and person node
        var calculateAngle = function(personId,hubId,personLocs,hubLocs){
            //Unsure whether to use px & py or x & y in person locations
            var personLoc=personLocs[personId];
            var hubLoc = hubLocs[hubId];
            var m = (personLoc.py-hubLoc.y)/(personLoc.px-hubLoc.x);
            var theta = Math.abs(Math.atan2(personLoc.py-hubLoc.y,personLoc.px-hubLoc.x));
            if(theta > (Math.PI / 2) ){
                return Math.PI-theta;
            }else{
                return theta;
            }
        };

        var calculateAngleByCoordinate = function(x2,y2,x1,y1){
            var theta = Math.abs(Math.atan2(y2-y1,x2-x1));
            if(theta > (Math.PI / 2) ){
                return Math.PI-theta;
            }else{
                return theta;
            }
        };

        //Some variables we are using for pieSpinning and vizRootSpinning function
        var hubLocations = findHubLocations();
        var personLocations={};
        var personID;
        var hubID;
        var hubToPersonAngle;
        var halfArcAngle;
        var rotationDegree;
        var peoplePaths;
        var rootPaths;
        var peoplePies = d3.
            select('svg')
            .selectAll('g.person')
            .selectAll('g.pie');
        var counter=0;


        var findHtoPAngle = function(px,py,hx,hy,angle){
            // 4 cases to determine the rotation angle
            var hToPAngle = 0;
            if(px < hx && py > hy)//quadrant 1
                hToPAngle = -(Math.PI/2-angle);
            else if(px > hx && py > hy)//quadrant 2
                hToPAngle = Math.PI/2-angle;
            else if(px > hx && py < hy)//quadrant 3
                hToPAngle = Math.PI/2+angle;
            else if(px < hx && py < hy)//quadrant 4
                hToPAngle = -(Math.PI/2+angle);
            return hToPAngle;
        }

        /*
         The goal of this function is to rotate the pie wedge of
         each person so that the wedge with biggest weight is pointing
         its appropriate hub.

         The general idea of our algorithm takes the following steps:
         1. Sort the wedges within a pie so that we have the the wedge with
         the biggest weight always start from angle 0 of the pie, which is the
         top of the pie

         2. For each person we want to first rotate the pie based on the angle between the
         the top of the pie and the line formed by the person and the hub with the
         highest weight and then readjust the pie by rotating half of the arc of the
         wedge to make the wedge point to the hub:
         a. Pick out the first path that represents the wedge with the highest weight
         for each person.
         b. Find the (x,y) coordinates of the person and the location of the hub with
         the most weight for the person by using the id store in the data associated with
         the path.
         c. Knowing the coordinates of the person and the hub, we can find the
         angle between the line formed by person and the hub and the x-axis. We
         made sure that the angle theta is from 0 to PI/2 (if theta > PI/2
         take PI-theta).
         d. We have a case for each quadrant:
         quadrant1: rotate -(PI/2-theta)
         quadrant2: rotate PI/2-theta
         quadrant3: rotate PI/2+theta
         quadrant4: rotate -(PI/2+theta)
         f. Find the halfArcAngle by using the startAngle and the endAngle of the path
         g. rotate the pie by using result from d and f. (Notice that SVG "rotate" runs
         in click-wise direction and it uses 360 degree instead of 2PI radius.)
         */
        var pieSpinning = function(){

            //Sorting the path that forms the wedges
            peoplePaths = d3.
                select('svg')
                .selectAll('g.person')
                .selectAll('g.pie')
                .selectAll('path')
                .sort(function(a,b){
                    return b.value- a.value;
                });

            //Rotating
            peoplePaths
                .each(function(d,i){
                    if(i==0){ //we only want the wedge with the highest weight
                        personID = d3.select(this.parentNode).data()[0].id;
                        hubID = d.data.id;

                        var angle = calculateAngle(personID, hubID,personLocations,hubLocations);
                        var px = personLocations[personID].px;
                        var py = personLocations[personID].py;
                        var hx = hubLocations[hubID].x;
                        var hy = hubLocations[hubID].y;

                        hubToPersonAngle = findHtoPAngle(px,py,hx,hy,angle);

                        halfArcAngle = (d.endAngle - d.startAngle)/2 ;

                        // notice that the rotation degree is measured in 360 degree
                        // instead of radius and it is clickwise
                        // We use -hubToPersonAngle because the angle was initially
                        // measured in counter-clickwise direction
                        rotationDegree = (halfArcAngle-hubToPersonAngle)*(180/Math.PI);

                        d3.select(this.parentNode)
                            .transition()
                            .attr('transform',function(){
                                return "rotate("+(rotationDegree)+")";
                            });
                    }
                });
        };

        var vizRootSpinning = function(){
            //Getting the vizRoot ID
            var vizID = macademia.history.get("nodeId").substring(2);
//            console.log(vizID);
            var px = hubLocations[vizID].x;
            var py = hubLocations[vizID].y;

            //Sorting the path that forms the wedges
            rootPaths = d3.
                select('svg')
                .select('g.vizRoot')
                .select('g.pie')
                .selectAll('path')
                .sort(function(a,b){
                    return b.value- a.value;
                });

            //Rotating
            rootPaths
                .each(function(d,i){
                    if(i==0){ //we only want the wedge with the highest weight
                        hubID = d.data.id;
                        var hx = hubLocations[hubID].x;
                        var hy = hubLocations[hubID].y;
//                        console.log(hubLocations[hubID]);

//                        var angle = calculateAngle(personID, hubID,personLocations,hubLocations);
                        var angle = calculateAngleByCoordinate(py,px,hy,hx);

                        hubToPersonAngle = findHtoPAngle(px,py,hx,hy,angle);

                        halfArcAngle = (d.endAngle - d.startAngle)/2 ;

                        rotationDegree = (halfArcAngle-hubToPersonAngle)*(180/Math.PI);

                        d3.select(this.parentNode)
                            .transition()
                            .duration(1500)
                            .ease('bounce')
                            .attr('transform',function(){
                                return "rotate("+(rotationDegree)+")";
                            });
                    }
                });
        };

        var collide = function(node) {
//            console.log(node);
            var r;
            if(!node.real){
                r=25;
            }else if(node.real[0]){
                r = node.real[0].r + 20;
            }else{
                r = node.real.r + 25;
            }

            var nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
//                console.log(quad);
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y);
                    var r;
                    if(!node.real){
                        r=25;
                    }else if(node.real[0]){
                        r = node.real[0].r;
                    }else{
                        r = node.real.r;
                    }
                    if(!quad.point.real){
                        r=r+25;
                    }else if(quad.point.real[0]){
                        r = r+quad.point.real[0].r;
                    }else{
                        r = r+quad.point.real.r;
                    }
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2
                    || x2 < nx1
                    || y1 > ny2
                    || y2 < ny1;
            };
        };

        // walk through iterations of convergence to final positions
        var maxBound = Number(d3.select("g.viz").attr('height'));
        var allNodes = d3.values(surrogates).concat(d3.values(people));
//        console.log(allNodes);
        force.on("tick", function (e) {

            var q = d3.geom.quadtree(allNodes),
                i = 0,
                n = allNodes.length;
//            console.log(q);
            while (++i < n) {
                q.visit(collide(allNodes[i]));
            }

            // Push different nodes in different directions for clustering.
//        var k = 6 * e.alpha;
//        nodes.forEach(function(o, i) {
//            o.y += i & 1 ? k : -k;
//            o.x += i & 2 ? k : -k;
//        });
            //Changing the location of person nodes based on the force
            peopleNodes.attr("transform", function (d) {
                d.x = pinch(d.x, 50, maxBound);
                d.y = pinch(d.y, 50, maxBound);
                personLocations[d.id]={id: d.id,px: d.px, py: d.py, x: d.x, y: d.y};
                return "translate(" + d.x + "," + d.y + ")";
            });

            //Rotating the pie of the person towards the hub that has most weight
            if(counter%3==0){ // we don't want to run it every time
                pieSpinning();
            }
            counter++;
        });

        pl.stop = function(){   force.stop();   };

        force.on('end',function(e){
            pieSpinning(); //To ensure that the last value is used, call once more
        });

        vizRootSpinning();

    }
    MC.options.register(pl, 'friction', 0.1);
    MC.options.register(pl, 'gravity', 0.0015);
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
//        console.log(d);
        if (d.type == 'hub') {
            return -10000;
        } else if (d.type == 'person') {
            return -2000;
        } else if (d.type == 'leaf'){
            return -2000;
        } else {
            return -100;
        }
    });

    return pl;
};