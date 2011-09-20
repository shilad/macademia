/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.initQueryViz = function(vizJson) {
//    console.profile();
    var paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());

    width = $(document).width()-50;
    height = $(document).height()-50;

    // create related interests
    var clusterColors = {};
    var clusterMap = {};
    var interests = {};

    $.each(vizJson.queries, function (i, id) {
        clusterColors[id] = 1.0 * i / vizJson.queries.length + 1.0 / vizJson.queries.length / 2;
        clusterMap[id] = {};
    });

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info && info.cluster >= 0);
        var hasSubCluster = (info && info.subcluster >= 0);
        var color = hasCluster ? clusterColors[info.cluster] : -1;
        interests[id] = new Interest({
            id:id,
            name:info.name,
            color:color,
            relevance : info.relevance,
            relatedQueryId : hasCluster ? info.cluster : -1
        });
        if (hasCluster && hasSubCluster) {
            if (!(info.subcluster in clusterMap[info.cluster])) {
                clusterMap[info.cluster][info.subcluster] = [];
            }
            if (id != info.cluster && id != info.subcluster) {
                clusterMap[info.cluster][info.subcluster].push(id);
            }
        }
    });

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, qid) {
        var subclusters = [];
        var related = [];   // remove....
        $.each(clusterMap[qid], function(cid, relatedInterests) {
            var info = vizJson.interests[cid];
            var ris = $.map(relatedInterests, function(ri) { return interests[ri]; });
            subclusters.push(
                    new InterestCluster({
                        id : cid,
                        relatedInterests : ris,
                        name : info.name,
                        color : clusterColors[qid],
                        paper : paper
                    }));
            related.push(interests[cid]);
        });
        var info = vizJson.interests[qid];
        var ic = new InterestCluster({
            id : qid,
            interests : interests,
            subclusters : subclusters,
//            relatedInterests : related, // interests will be added here as people are added to the viz
            name : info.name,
            color : clusterColors[qid],
            paper : paper
        });
        queryInterests[qid] = ic;
    });

    // Create people
    var people = [];

    // Normalize 'overall' relevances to modulate person ring size
    var maxRelevance = 0.0;
    var minRelevance = 1000000000000.0;
    $.each(vizJson.people, function(id, pinfo) {
        maxRelevance = Math.max(pinfo.relevance.overall, maxRelevance);
        minRelevance = Math.min(pinfo.relevance.overall, minRelevance);
    });

    var limit = 0;
    if ( screenArea() < 650000 ) {
        limit = 6;
    } else {
        limit = 20;
    }

    $.each(vizJson.people, function(id, pinfo) {
        if( people.length >= limit ) {
//            return false; // break
        }

        var pinterests = $.map(pinfo.interests, function(i) { return interests[i]; });
        var totalRelevance = 0.0;
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall') {totalRelevance += weight;}
        });
        var totalCount = 0.0;
        $.each(pinfo.count, function(id, n) {
            if (id != 'overall' && id != '-1') {totalCount += n;}
        });
        var interestGroups = [];
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall' && weight > 0) {
                interestGroups.push([
                    queryInterests[id],
                    pinfo.relevance[id],
                    pinfo.count[id] / totalCount
                ]);
            }
        });
        var r = 20 * (pinfo.relevance.overall - minRelevance) / (maxRelevance - minRelevance) + 10;
        var person = new Person({
            relevance : pinfo.relevance,
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : $.grep(pinterests, function(i) {return (i.relatedQueryId >= 0);}),
            nonRelevantInterests : $.grep(pinterests, function(i) {return (i.relatedQueryId < 0);}),
            collapsedRadius : r
        });
        if (person.interests.length > 12) {
            person.expandedRadius *= Math.sqrt(person.interests.length / 12);
        }
        people.push(person);
    });

    // resize the query interests
    $.each(queryInterests, function(id, qi) {
        if (qi.relatedInterests.length > 12) {
            qi.expandedRadius *= Math.sqrt(qi.relatedInterests.length / 12);
        }
    });

    var qv = new QueryViz({
        people : people,
        queryInterests : $.map(queryInterests, function(v, k) {return v;}),
        paper : paper
    });
    qv.layoutInterests();
    qv.layoutPeople();
    qv.setupListeners();
    macademia.nbrviz.qv = qv;
//    console.profileEnd();
};

/**
 * Construct a new query-based visualization.
 * @param params - An object with the following keys and values:
 * people: A list of
 */
function QueryViz(params) {
    this.people = params.people;
    this.queryInterests = params.queryInterests;
    this.paper = params.paper;
    this.edges = [];
    this.highlighted = [];

    this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
    this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});
    this.fadeScreen.toBack();

}

QueryViz.prototype.setupListeners = function() {
    // Set up the event listeners
    var self = this;
    $.each(this.people, function (index, p) {
        p.hover(
                function () { self.handlePersonHover(p); },
                function () { self.handlePersonUnhover(p); }
            );
    });
    $.each(this.queryInterests, function (index, i) {
        i.hover(
                function () { self.handleInterestClusterHover(i); },
                function () { self.handleInterestClusterUnhover(i); }
            );
        i.hoverInterest(
                function (p, i2, n) { self.handleInterestHover(p, i2, n); },
                function (p, i2, n) { self.handleInterestUnhover(p, i2, n); }
            );
        i.move(function (interestCluster, x, y) {
            self.relayoutPeople(interestCluster, x, y);
        });
    });
};

function distributePeople( coords ) {
    var val = null;
    for( var i = 0; i < coords.length - 1; i++ ) {
        if( posEquals( coords[i], coords[coords.length -1] ) ){
            coords[coords.length-1]['x'] = Math.floor( Math.random() * ($(document).width() - 190) ) + 95;
            coords[coords.length-1]['y'] = Math.floor( Math.random() * ($(document).height() - 190) ) + 95;
            i=0;
            val = coords[coords.length-1];
        }
    }
    return val;
}



QueryViz.prototype.layoutInterests = function() {
    var a = ($(document).width() - 600)/2;
    var b = ($(document).height()-360)/2;
    var cx = $(document).width()/2;
    var cy = $(document).height()/2;

    $.each(this.queryInterests, function(index, interestCluster) {
        var th = index * (360/vizJson.queries.length) * (Math.PI/180);
        var r = function( th ) {
                    return (a * b)/
                    Math.sqrt(
                        Math.pow( b * Math.cos(th), 2 ) +
                        Math.pow( a * Math.sin(th), 2 )
                    );
                }(th);

        var xDisp = Math.round( r * Math.cos(th) ) + cx;
        var yDisp = Math.round( r * Math.sin(th) ) + cy;

        interestCluster.setPosition(xDisp, yDisp);

        var mag = new Magnet( new Vector( xDisp, yDisp), interestCluster.id );
    });
};

QueryViz.prototype.layoutPeople = function( /*coords*/ ) {
    var self = this;
    $.each(this.people, function(i, person) {
        var p = new Point( Vector.random() );
        p.setStuff( i, person.relevance );
    });
    startLayout(.1);
    $.each(Point.points, function(index, p) {
        self.people[p.id].setPosition( p.screenX(), p.screenY());
    });
};

/**
 * Re-layout people after a particular interest cluster is moved to a new location.
 */
QueryViz.prototype.relayoutPeople = function(interestCluster, x, y) {
    var start = Date.now();
//    console.log('on move ' + interestCluster.name + ' to ' + x + ', ' + y);
    var mag = Magnet.findById(interestCluster.clusterId);
    mag.setPosition(x, y);
    startLayout(1);
    var step1 = Date.now();
    var self = this;
    $.each(Point.points, function(index, p) {
//        console.log('new person: ' + p.id+", "+p.screenX()+", "+p.screenY());
        self.people[p.id].setPosition(p.screenX(), p.screenY()); //TODO screenx
    });
    var step2 = Date.now();
//    console.log('step 1 took ' + (step1 - start) + ' and step 2 ' + (step2 - step1));
};



// TODO: make this number relative to stroke width
function posEquals( coord1, coord2 ) {
    if( (coord1['x'] + 150) > coord2['x'] && (coord1['x'] - 150) < coord2['x'] ) {
        if( (coord1['y'] + 150) > coord2['y'] && (coord1['y'] - 150) < coord2['y'] ) {
            return true;
        }
    }
    return false;
}

QueryViz.prototype.raiseScreen = function(focus) {
    this.fadeScreen.stop();
    this.fadeScreen.insertBefore(focus);
    this.fadeScreen.animate({opacity : 0.85}, 400);
};

QueryViz.prototype.lowerScreen = function() {
    this.fadeScreen.stop();
    var self = this;
    this.fadeScreen.animate({opacity : 0.0}, 200, function () {self.fadeScreen.toBack();});
};

QueryViz.prototype.handlePersonHover = function(person) {
    person.toFront();
    this.raiseScreen(person.getBottomLayer());
};

QueryViz.prototype.handlePersonUnhover = function(person) {
    this.lowerScreen();
};

QueryViz.prototype.handleInterestClusterHover = function(interest) {
//    console.log("handle interest cluster hover: " + interest.name);
    interest.toFront();
    this.raiseScreen(interest.getBottomLayer());
};

QueryViz.prototype.handleInterestClusterUnhover = function(interest) {
//    console.log("handle interest cluster unhover" + interest.name);
    this.lowerScreen();
    this.hideEdges();
};

QueryViz.prototype.handleInterestHover = function(parentNode, interest, interestNode) {
//    console.log("handle interest hover" + interest.name);
    this.hideEdges();
    var self = this;
    $.each(this.people, function (i, p) {
        $.each(p.interests, function(index, interest2) {
            if (interest.id == interest2.id) {
                self.drawEdge(parentNode, p, interestNode);
                p.toFront(parentNode.getBottomLayer());
                self.highlighted.push(p);
            }
        });
    });
};

QueryViz.prototype.handleInterestUnhover = function(parentNode, interest, interestNode) {
//    console.log("handle interest unhover" + interest.name);
    this.hideEdges();
};

QueryViz.prototype.drawEdge = function(parentNode, person, interestNode) {
    var svgStr = 'M' + interestNode.getX() + ' ' + interestNode.getY() + 'L' + person.x + ' ' + person.y + 'Z';
    var path = this.paper.path(svgStr);
    path.insertBefore(parentNode.getBottomLayer());
    path.attr({stroke : '#f00', 'stroke-width' : 2, 'stroke-dasharray' : '- ', 'stroke-opacity' : 0.2});
    this.edges.push(path);
};

QueryViz.prototype.hideEdges = function() {
    $.each(this.edges, function (i, e) { e.remove(); });
    this.edges = [];
    $.each(this.highlighted, function (i, e) { e.toBack(); });
    this.highlighted = [];
};

// TODO group related pie slices on person node (matching colors adjacent to each other)
// TODO arrange in order of increasing rgb hex code?

function screenArea() {
    return $(document).width() * $(document).height();
}