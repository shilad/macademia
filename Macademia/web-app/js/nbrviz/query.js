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



QueryViz.prototype.layoutInterests = function(vizJson) {
    var a = ($(document).width() - 200)/2;
    var b = ($(document).height()-200)/2;
    var cx = $(document).width()/2;
    var cy = $(document).height()/2;

    // layout up to four magnets "by hand."
    var positions = [
            [],
            [[0.2, 0.0]],
            [[-0.8, 0.0], [0.8, 0.0]],
            [[-0.8, -0.8], [0, 0.8], [0.8, -0.8]],
            [[-0.8, 0.0], [0.8, 0.0], [0.0, -1.0], [0.0, 1.0]]
    ];

    var self = this;
    $.each(this.queryInterests, function(index, interestCluster) {
        var xDisp, yDisp;
        if (self.queryInterests.length < positions.length) {
            var p = positions[self.queryInterests.length][index];
            xDisp = p[0] * a + cx;
            yDisp = p[1] * b + cy;
        } else {
            var th = index * (360/self.queryInterests.length) * (Math.PI/180);
            var r = function( th ) {
                        return (a * b)/
                        Math.sqrt(
                            Math.pow( b * Math.cos(th), 2 ) +
                            Math.pow( a * Math.sin(th), 2 )
                        );
                    }(th);

            xDisp = Math.round( r * Math.cos(th) ) + cx;
            yDisp = Math.round( r * Math.sin(th) ) + cy;
        }
        console.log('xDisp is ' + xDisp + ', yDisp is ' + yDisp);

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