/**
 * Construct a new query-based visualization.
 * @param params - An object with the following keys and values:
 * people: A list of
 */
function ExploreViz(params) {
    this.people = params.people;
    this.rootId = params.rootId;
    this.rootClass = params.rootClass;
    this.parentInterests = params.parentInterests;
    this.paper = params.paper;
    this.edges = [];
    this.highlighted = [];

    this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
    this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});
    this.fadeScreen.toBack();

};


ExploreViz.prototype.setupListeners = function() {
    // Set up the event listeners
    var self = this;
    $.each(this.people, function (index, p) {
        p.hover(
                function () { self.handlePersonHover(p); },
                function () { self.handlePersonUnhover(p); }
            );
    });
    $.each(this.parentInterests, function (index, i) {
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
};


ExploreViz.prototype.layoutInterests = function(vizJson) {

    var xr = macademia.nbrviz.magnet.X_RANGE - .2;
    var yr = macademia.nbrviz.magnet.Y_RANGE - .2;

    var PARENT_POSITIONS_BY_LENGTH = [
        [],
        [[0.0, 0.0]],
        [[-xr, 0.0], [xr, 0.0]],
        [[-xr, -yr], [0, yr], [xr, -yr]],
        [[-xr, 0.0], [xr, 0.0], [0.0, -yr], [0.0, yr]]
    ];
    var a = ($(document).width() - 200)/2;
    var b = ($(document).height()-200)/2;
    var cx = $(document).width()/2;
    var cy = $(document).height()/2;

    console.log('parentInterests length is ' + this.parentInterests.length);
    // layout up to four magnets "by hand." minus 1 because of root
    var positions = PARENT_POSITIONS_BY_LENGTH[this.parentInterests.length - 1];
    console.log('positions is ' + positions);
    var self = this;
    var index = 0;
    $.each(this.parentInterests, function(i, interestCluster) {
        var p = (interestCluster.id == self.rootId) ? [0.0,0.0] : positions[index];
        var point = new Point(new Vector(p[0], p[1]));
        var mag = new Magnet(point.p, interestCluster.id );
        interestCluster.setPosition(point.screenX(), point.screenY());
        console.log('for ' + p + 'pos is ' + point.screenX() + ',' + point.screenY())
        if (interestCluster.id != self.rootId) {
            index += 1;
        }
    });
};

ExploreViz.prototype.layoutPeople = function( /*coords*/ ) {
    var self = this;
    $.each(this.people, function(i, person) {
        var p = new Point( Vector.random() );
        p.setStuff( i, person.relevance );
    });
    var iters = 0;
    var f = function() {
        startLayout(.1);
        $.each(Point.points, function(index, p) {
            self.people[p.id].setPosition( p.screenX(), p.screenY());
        });
        if (iters++ < 100) {
            window.setTimeout(f, 10);
        }
    };
    $.each(Point.points, function(index, p) {
        self.people[p.id].setPosition( p.screenX(), p.screenY());
    });
    window.setTimeout(f, 200);
};
