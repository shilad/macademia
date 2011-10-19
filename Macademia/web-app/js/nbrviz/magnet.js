macademia.nbrviz.magnet = {};

var MM = macademia.nbrviz.magnet;

macademia.nbrviz.magnet.init = function () {

    // constants
    MM.WIDTH = macademia.nbrviz.paper.width;
    MM.HEIGHT = macademia.nbrviz.paper.height;
    MM.ZOOM_CONSTANT = Math.min(MM.WIDTH, MM.HEIGHT) / 2;

    // maximum x and y values
    MM.X_RANGE = MM.WIDTH / 2.0 / MM.ZOOM_CONSTANT * .9;
    MM.Y_RANGE = MM.HEIGHT / 2.0 / MM.ZOOM_CONSTANT * .9;

    // attraction to magnets, and optimal distance from magnets
    MM.GRAVITATIONAL_CONSTANT = 100.0;
    MM.OPTIMAL_MAGNET_PERSON_DIST = 0.1;

    // repulsion between nodes
    MM.REPULSE_CONSTANT = 0.01;

    // repulsion from walls
    MM.WALL_REPULSE_CONSTANT = 0.2;

    // (virtual) time in between recomputations
    MM.TIMESTEP = 0.5;
};

function Point(position) {
	this.p = position; // position
	this.v = new Vector(0, 0); // velocity
	this.f = new Vector(0, 0); // force
}
Point.points = [];

Point.prototype.setStuff= function( id, relevance ) {
	this.relevance = relevance;
	this.id = id;

    Point.points.push(this);
};

Point.prototype.applyForce = function(force) {
	this.f = this.f.add(force);
};

// points are slightly repulsed by other points
Point.applyCoulombsLaw = function() {

	Point.points.forEach(function(point1) {
		Point.points.forEach(function(point2) {
			if (point1 !== point2) {
				var d = point1.p.subtract(point2.p);
				var distance = d.magnitude() + 0.01;
				var direction = d.normalise();
				// apply force to each end point
                var f = direction.multiply(MM.REPULSE_CONSTANT).divide(distance * distance);
                point1.applyForce(f);
				point2.applyForce(f.multiply(-1));
			}
		});
        // aggregate repulsions from walls
        var f = function(z, range) {
            var sign = (z < 0) ? -1 : +1;
            return -sign * (range - Math.min(Math.abs(z), range) + 0.0001)
        };
        var deltaX = new Vector(f(point1.p.x, MM.X_RANGE), 0);
        var wallForceX = deltaX.multiply(MM.WALL_REPULSE_CONSTANT/ deltaX.magnitude2());
        var deltaY = new Vector(0, f(point1.p.y, MM.Y_RANGE));
        var wallForceY = deltaY.multiply(MM.WALL_REPULSE_CONSTANT/ deltaY.magnitude2());
//        if (deltaX.magnitude() < .1 || deltaY.magnitude() < .1) {
//            console.log('id ' + point1.id + ' is ' + point1.p + ' and forces are ' + wallForceX + ', ' + wallForceY);
//        }
        point1.applyForce(wallForceX);
        point1.applyForce(wallForceY);
    });
};

Point.updateVelocity = function() {
	var damping = 0.3; // damping constant, points lose velocity over time

    // only go 1/5 of the screen at a time, max
    var maxMagnitude = Math.min(MM.X_RANGE, MM.Y_RANGE) / 5 / MM.TIMESTEP;
	Point.points.forEach(function(p) {
		p.v = p.v.add(p.f.multiply(MM.TIMESTEP)).multiply(damping);
        var m = p.v.magnitude();
        if (m > maxMagnitude) {
            p.v = p.v.multiply(maxMagnitude / m);
        }
		p.f = new Vector(0,0);
	});
};

var POSITIONS = [];
var INDEX = 0;

Point.updatePosition = function() {
//    var maxD = 0;
//    var meanD = 0;

	Point.points.forEach(function(p) {
//        var sx0 = p.screenX();
//        var sy0 = p.screenY();
		p.p = p.p.add(p.v.multiply(MM.TIMESTEP));
        p.p.x = macademia.pinch(p.p.x, -MM.X_RANGE, MM.X_RANGE);
        p.p.y = macademia.pinch(p.p.y, -MM.Y_RANGE, MM.Y_RANGE);
//        var sx = p.screenX();
//        var sy = p.screenY();
//        var d = Math.sqrt((sx0 - sx) * (sx0 - sx) + (sy0 - sy) * (sy0 - sy));
//        meanD += d;
//        if (d > maxD) {
//            maxD = d;
//        }
	});
//    if (INDEX++ % 100 == 0) {
//        var ps = [];
//        $.each(Point.points, function() {
//            ps.push({x : this.screenX(), y : this.screenY()});
//        });
//        POSITIONS.push(ps);
//    }

//    console.log('meanD: ' + meanD/Point.points.length + ', maxD: ' + maxD);
};

Point.printDeltas = function() {
    for (var i = 0; i < POSITIONS.length; i++) {
        var maxD = 0;
        var meanD = 0;

        for (var j = 0; j < Point.points.length; j++) {
            var p0 = POSITIONS[i][j];
            var p1 = Point.points[j];
            var sx0 = p0.x;
            var sy0 = p0.y;
            var sx1 = p1.screenX();
            var sy1 = p1.screenY();
            var d = Math.sqrt((sx0 - sx1) * (sx0 - sx1) + (sy0 - sy1) * (sy0 - sy1));
            meanD += d;
            if (d > maxD) {
                maxD = d;
            }
        }
//        console.log('i: ' + i + 'n: ' + Point.points.length +
//                ' meanD: ' + meanD / Point.points.length + ', maxD: ' + maxD);
    }
};

// convert point to screen coordinates
Point.prototype.screenX = function() {
	return this.p.x * MM.ZOOM_CONSTANT + MM.WIDTH/2.0;
};

// convert point to screen coordinates
Point.prototype.setScreenX = function(x) {
    this.p.x = (x - MM.WIDTH/2.0) / MM.ZOOM_CONSTANT;
};

Point.prototype.screenY = function() {
	return this.p.y * MM.ZOOM_CONSTANT + MM.HEIGHT/2.0;
};


// convert point to screen coordinates
Point.prototype.setScreenY = function(y) {
    this.p.y = (y - MM.HEIGHT/2.0) / MM.ZOOM_CONSTANT;
};


Magnet.prototype.constructor = Magnet;
function Magnet(position, id) {
	this.p = position;
	this.id = id;
	this.relevances = {};
	
	Magnet.magnets.push(this);
}

Magnet.clear = function() {
    Point.points = [];
    Magnet.magnets  = [];
};


Magnet.magnets = [];

Magnet.findById = function(id) {
    for (var i = 0; i < Magnet.magnets.length; i++) {
        if (Magnet.magnets[i].id == id) {
            return Magnet.magnets[i];
        }
    }
    return null;
};

Magnet.prototype.setPosition = function(x, y) {
    this.p.x = x;
    this.p.y = y;
};

Magnet.prototype.computeDistance = function(pnt) {
	//console.log("value 1: "+Math.sqrt( Math.pow((this.point.p.x - pnt.screenX() ),2) + Math.pow((this.point.p.y - pnt.screenY() ),2) ));
    //console.log("value2: "+this.point.p.subtract(pnt.p).magnitude());
    //return this.point.p.subtract(pnt.p).magnitude();
    return Math.sqrt( Math.pow(this.p.x - pnt.p.x,2) + Math.pow(this.p.y - pnt.p.y,2) );
};

Magnet.prototype.forceDirection = function(pnt) {
	return new Vector(-this.p.x + pnt.p.x, -this.p.y + pnt.p.y).normalise();
};

Magnet.prototype.attractPeople = function() {
	var self = this;
	$.each(Point.points, function(i, p){
		var radius = self.computeDistance(p);

        // spring repulsion for nodes very close to the cluster
        var magnitude = MM.REPULSE_CONSTANT / Math.pow(radius + 0.001, 2.0);

        // attraction
		if(self.relevances[p.id] && !isNaN(self.relevances[p.id])) {
            var stretch = Math.max(0, radius - MM.OPTIMAL_MAGNET_PERSON_DIST) + 0.00001;
            var rel = self.relevances[p.id];
            var m2 = ( -1.0 * rel * MM.GRAVITATIONAL_CONSTANT  * stretch)
//            console.log('radius: ' + radius + ' relevance: ' + self.relevances[p.id] +
//                    ', forces: ' + magnitude + ', ' + m2);
            magnitude += m2;
        }
//        console.log('force direction is ' + self.forceDirection(p));
//        console.log('term 1 is ' + ( self.relevances[p.id] * (-1.0) * GRAVITATIONAL_CONSTANT ));
//        console.log('term 2 is ' + ( DECAY_CONSTANT / Math.pow((Math.abs(radius-(60)+10)/30.0),4) ));

//        console.log('radius ' + radius + ', relevances' + self.relevances[p.id]);
        var gForce = self.forceDirection(p).multiply(magnitude);

//        console.log('gforce is ' + gForce);
		p.applyForce( gForce );
	});
};

Magnet.normalizeRelevances = function() {
    var meanRelevance = 0.0;
    var n = 0;
    Point.points.forEach(function(p) {
        var sum = 0.0;
        $.each(p.relevance, function (iid, rel) {
            if (Magnet.findById(iid)) { sum += rel; }
        });
        $.each(p.relevance, function (iid, rel) {
            if (Magnet.findById(iid)) {
                p.relevance[iid] /= sum;
            }
        });
    });
	Magnet.magnets.forEach(function(mag){
        Point.points.forEach(function(p){
            if ( p.relevance[self.id] != null ) {
                meanRelevance += p.relevance[self.id];
                n++;
            }
        });
	});
    meanRelevance /= n;
	Magnet.magnets.forEach(function(mag){
        var self = this;
        Point.points.forEach(function(p){
            if ( p.relevance[self.id] != null ) {
                self.relevances[p.id] = p.relevance[self.id] / meanRelevance;
            }
        });
	});
};

MM.oneLayoutIteration = function() {
	Magnet.normalizeRelevances();
    Magnet.magnets.forEach(function(mag){
        mag.attractPeople();
    });

    Point.applyCoulombsLaw();
    Point.updateVelocity();
    Point.updatePosition();

    // calculate kinetic energy of system
    var k = 0.0;
    Point.points.forEach(function(p){
        var speed = p.v.magnitude();
        k += speed * speed;
    });

    return k;
}
