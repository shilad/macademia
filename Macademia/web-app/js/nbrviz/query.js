/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.initQueryViz = function(vizJson) {
    var paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());

    width = $(document).width()-50;
    height = $(document).height()-50;

    // create related interests
    var clusterColors = {};
    var relatedInterests = {};
    var relatedInterestsById = {};

    $.each(vizJson.queries, function (i, id) {
        clusterColors[id] = 1.0 * i / vizJson.queries.length + 1.0 / vizJson.queries.length / 2;
        relatedInterests[id] = [];
        vizJson.interests[id].cluster = id;  // work around omission from json service...
    });

    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info.cluster && info.cluster >= 0);
        var color = -0.7;
        if (hasCluster) {
            color = clusterColors[info.cluster];
        }
        var ri = new Interest({id:id, name:info.name, color:color});
        relatedInterestsById[id] = ri;
        if (hasCluster) {
            relatedInterests[info.cluster].push(ri);
        }
    });

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, id) {
        var info = vizJson.interests[id];
        var ic = new InterestCluster({
            id : id,
            relatedInterests : relatedInterests[id],
            name : info.name,
            color : clusterColors[id]
        });
        queryInterests[id] = ic;
    });

    // Create people
    // TODO: incorporate interest similarity scores
    var people = [];

    // Normalize 'overall' relevances to modulate person ring size
    // TODO: implement this in JSON service and remove from js
    var overallRelevance = 0.0;
    $.each(vizJson.people, function(id, pinfo) {
        if (pinfo.relevance.overall > overallRelevance) {
            overallRelevance = pinfo.relevance.overall;
        }
    });

    $.each(vizJson.people, function(id, pinfo) {
        var pinterests = [];
        var pnrinterests = [];
        $.each(pinfo.interests, function(i, id) {
            var iinfo = vizJson.interests[id];
            if (id in queryInterests) {
                pinterests.push(relatedInterestsById[id]);
            } else if (iinfo.cluster && iinfo.cluster >= 0) {
                pinterests.push(relatedInterestsById[id]);
            } else {
                pnrinterests.push(relatedInterestsById[id]);
            }
        });
        var totalRelevance = 0.0;
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall') {totalRelevance += weight;}
        });
        var interestGroups = [];
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall' && weight > 0) {
                interestGroups.push([
                    queryInterests[id],
                    1.0 * weight / totalRelevance
                ]);
            }
        });
        console.log('relevance is ' + pinfo.relevance.overall);
        var person = new Person({
            relevance : pinfo.relevance,
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : pinterests ,
            nonRelevantInterests : pnrinterests,
            strokeWidth : (screenArea() /20000 * pinfo.relevance.overall/overallRelevance) + 10
        });
        people.push(person);
        var limit = 0;
        if ( screenArea() < 650000 ) {
            limit = 6;
        } else {
            limit = 10;
        }
        if( people.length >= limit ) {
            return false; // break
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

    // Set up the transparency filter
    this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
    this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});

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
                function (i2, n) { self.handleInterestHover(i2, n); },
                function (i2, n) { self.handleInterestUnhover(i2, n); }
            );
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

        var mag = new Magnet( new Vector( xDisp, yDisp), interestCluster.id ); //TODO: make sure this index matches up with the index for the relevance table
    });
};

QueryViz.prototype.layoutPeople = function( /*coords*/ ) {
    var self = this;
    $.each(this.people, function(i, person) {
        //var xRand = Math.floor( Math.random() * ($(document).width() - 190) ) + 95;
        //var yRand = Math.floor( Math.random() * ($(document).height() - 190) ) + 95;

        // TODO: fixme: why would this ever not be true?
        if (person.interestGroups.length > 0) {
            //coords.push({'x':xRand, 'y':yRand});
            /*var val;
            if( (val = distributePeople( coords )) != null ) {
                xRand = val['x'];
                yRand = val['y'];
            }*/

            var p = new Point( Vector.random() );
            p.setStuff( i, person.relevance );  //TODO: this doenst exist in person yet

            //person.setPosition(xRand, yRand);
        }
    });
    startLayout();
    $.each(Point.points, function(index, p) {
        self.people[p.id].setPosition( p.screenX(), p.screenY()); //TODO screenx
    });
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
    interest.toFront();
    this.raiseScreen(interest.getBottomLayer());
};

QueryViz.prototype.handleInterestClusterUnhover = function(interest) {
    this.lowerScreen();
};

QueryViz.prototype.handleInterestHover = function(interest, interestNode) {
    this.hideEdges();
    var self = this;
    $.each(this.people, function (i, p) {
        $.each(p.interests, function(index, interest2) {
            if (interest.id == interest2.id) {
                self.drawEdge(p, interestNode);
                p.toFront();
                self.highlighted.push(p);
            }
        });
    });
//    console.log('in : ' + interest.name + ' ' + interestNode.getX() + ', ' + interestNode.getY());
};

QueryViz.prototype.handleInterestUnhover = function(interest, interestNode) {
    this.hideEdges();
};

QueryViz.prototype.drawEdge = function(person, interestNode) {
    var svgStr = 'M' + interestNode.getX() + ' ' + interestNode.getY() + 'L' + person.xPos + ' ' + person.yPos + 'Z';
    var path = this.paper.path(svgStr);
    path.insertBefore(interestNode.getBottomLayer());
    path.attr({stroke : '#f00', 'stroke-width' : 2, 'stroke-dasharray' : '- ', 'stroke-opacity' : 0.4});
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