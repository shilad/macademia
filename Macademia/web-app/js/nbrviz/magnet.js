/*
 * This file is interpreted both as a component of
 * the macademia namespace and as a discrete script
 * for use in the layout-worker.
 */
var magnet = {};
var MM = magnet;
var macademia = macademia || {
    pinch : function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    nbrviz : {}
};
macademia.nbrviz.magnet = magnet;

magnet.init = function (width, height) {
    // constants
    MM.WIDTH = width;
    MM.HEIGHT = height;
    MM.ZOOM_CONSTANT = Math.min(MM.WIDTH, MM.HEIGHT) / 2;

    // maximum x and y values
    MM.X_RANGE = MM.WIDTH / 2.0 / MM.ZOOM_CONSTANT * .9;
    MM.Y_RANGE = MM.HEIGHT / 2.0 / MM.ZOOM_CONSTANT * .9;

    // attraction to magnets, and optimal distance from magnets
    MM.GRAVITATIONAL_CONSTANT = 1.0;
    MM.OPTIMAL_MAGNET_PERSON_DIST = 0.3;

    // Barnes-Hut threshold at which to approximate
    MM.BH_THRESHOLD = 0.35;

    // repulsion between nodes
    MM.REPULSE_CONSTANT = 0.04;

    // repulsion from walls
    MM.WALL_REPULSE_CONSTANT = 0.05;

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
};

Point.prototype.equals = function(other) {
    return other.id == this.id;
};

Point.prototype.applyForce = function(force) {
	this.f = this.f.add(force);
};

Point.pointsToJSON = function(points) {
    var json = {};
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        json["p_"+i] = {
            "p" : p.p,
            "v" : p.v,
            "f" : p.f,
            "id" : p.id,
            "relevance" : p.relevance
        }
    }
    return json;
};

Point.makePointsFromJSON = function(pointsJSON) {
    var points = [];
    for (var key in pointsJSON) {
        var point = pointsJSON[key];
        var p = new Point(new Vector(point.p.x, point.p.y));
        p.v = new Vector(point.v.x, point.v.y);
        p.f = new Vector(point.f.x, point.f.y);
        p.setStuff(point.id, point.relevance);
        points.push(p);
    }
    return points;
};

Point.prototype.applyCoulombsLaw = function(vec, mass) {
    var d = this.p.subtract(vec);
    var distance = d.magnitude() + 0.01;
    var direction = d.normalise();

    var f = direction.multiply(MM.REPULSE_CONSTANT * mass).divide(distance * distance);
    this.applyForce(f);
};

// points are slightly repulsed by other points
Point.repulsePoints = function(points) {
    var bhTree = new BarnesHut();
    for (var pInd = 0; pInd < points.length; pInd++) {
        bhTree.addPointToTree(points[pInd]);
    }

    for (var i = 0; i < points.length; i++) {
        var point = points[i];

        bhTree.applyPointRepulsion(point);

        // aggregate repulsions from walls
        var f = function(z, range) {
            var sign = (z < 0) ? -1 : +1;
            return -sign * (range - Math.min(Math.abs(z), range) + 0.01)
        };
        var deltaX = new Vector(f(point.p.x, MM.X_RANGE), 0);
        var wallForceX = deltaX.multiply(MM.WALL_REPULSE_CONSTANT/ deltaX.magnitude2());
        var deltaY = new Vector(0, f(point.p.y, MM.Y_RANGE));
        var wallForceY = deltaY.multiply(MM.WALL_REPULSE_CONSTANT/ deltaY.magnitude2());
        point.applyForce(wallForceX);
        point.applyForce(wallForceY);

    }
};

Point.updateVelocity = function(points) {
	var damping = 0.3; // damping constant, points lose velocity over time

    // only go 1/5 of the screen at a time, max
    var maxMagnitude = Math.min(MM.X_RANGE, MM.Y_RANGE) / 5 / MM.TIMESTEP;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.v = p.v.add(p.f.multiply(MM.TIMESTEP)).multiply(damping);
        var m = p.v.magnitude();
        if (m > maxMagnitude) {
            p.v = p.v.multiply(maxMagnitude / m);
        }
		p.f = new Vector(0,0);
    }
};

var POSITIONS = [];
var INDEX = 0;

Point.updatePosition = function(points) {
//    var maxD = 0;
//    var meanD = 0;

	for (var i = 0; i < points.length; i++) {
        var p = points[i];
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
	}
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

Magnet.magnetsToJSON = function(magnets) {
    var json = {};
    for(var i = 0; i < magnets.length; i++) {
        var mag = magnets[i];
        json["mag_"+i] = {
            "p" : mag.p,
            "id" : mag.id,
            "relevances" : mag.relevances
        }
    }
    return json;
};

Magnet.makeMagnetsFromJSON = function(magnetsJSON) {
    var magnets = [];
    for (var key in magnetsJSON) {
        var mag = magnetsJSON[key];
        var m = new Magnet(mag.p, mag.id);
        m.relevances = mag.relevances;
        magnets.push(m);
    }
    return magnets;
};

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

Magnet.prototype.attractPeople = function(points) {
    var repulse = MM.REPULSE_CONSTANT;
    if (this.p.x == 0.0 && this.p.y == 0) { repulse *= 6; }

	var self = this;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var radius = self.computeDistance(p);

        // spring repulsion for nodes very close to the cluster
        var magnitude = repulse / Math.pow(radius + 0.001, 2.0);

        // attraction
		if(self.relevances[p.id] && !isNaN(self.relevances[p.id])) {
            var stretch = Math.max(0, radius - MM.OPTIMAL_MAGNET_PERSON_DIST) + 0.00001;
            var rel = self.relevances[p.id];
            var m2 = ( -1.0 * rel * rel * MM.GRAVITATIONAL_CONSTANT  * stretch);
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
    }
};

Magnet.normalizeRelevances = function(points, magnets) {
    var meanRelevance = 0.0;
    var n = 0;
    var i, j, mag, p;
    for (i = 0; i < points.length; i++) {
        p = points[i];
        var sum = 0.0;
        for (var relKey in p.relevance) {
            if (Magnet.findById(relKey)) {
                sum += p.relevance[relKey]
            }
        }
        for (var relKey2 in p.relevance) {
            if (Magnet.findById(relKey2)) {
                p.relevance[relKey2] /= sum;
            }
        }
    }
    for (i = 0; i < magnets.length; i++) {
        mag = magnets[i];
        for (j = 0; j < points.length; j++) {
            p = points[j];
            if ( p.relevance[mag.id] != null ) {
                meanRelevance += p.relevance[mag.id];
                n++;
            }
        }
    }
    meanRelevance /= n;
    for (i = 0; i < magnets.length; i++) {
        mag = magnets[i];
        for (j = 0; j < points.length; j++) {
            p = points[j];
            if ( p.relevance[mag.id] != null ) {
                mag.relevances[p.id] = p.relevance[mag.id] / meanRelevance;
            }
        }
	}
};

MM.oneLayoutIteration = function(points, magnets) {
	Magnet.normalizeRelevances(points, magnets);
    for (var i = 0; i < magnets.length; i++) {
        magnets[i].attractPeople(points);
    }

    Point.repulsePoints(points);
    Point.updateVelocity(points);
    Point.updatePosition(points);

    // calculate kinetic energy of system
    var k = 0.0;
    for (i = 0; i < points.length; i++) {
        var speed = points[i].v.magnitude();
        k += speed * speed;
    }

    return k;
};

/**
 * Barnes-Hut tree is an object defined as:
 * { area: {
 *          areaRatio: (0, 100],
 *          topLeft: Vector,
 *          bottomRight: Vector
 *     },
 *     // if non-empty
 *     center: Vector if internal, Point if external,
 *     mass: number of child Points,
 *     // if internal node with child Points
 *     nw: {area: {...} ...},
 *     ne: {area: {...} ...},
 *     sw: {area: {...} ...},
 *     se: {area: {...} ...}
 * }
 */
function BarnesHut() {
    this.root = {area: {
            areaRatio:100.0,
            topLeft: new Vector(-1*MM.X_RANGE, MM.Y_RANGE),
            bottomRight: new Vector(MM.X_RANGE, -1*MM.Y_RANGE)
        }};
}

BarnesHut.prototype.addPointToTree = function(point) {
    this.addPointToTreeRecursive(this.root, point);
};

BarnesHut.prototype.addPointToTreeRecursive = function(tree, point) {
    if (Object.keys(tree).length == 1) {
        // empty external node (only area), add the new point in
        tree["mass"] = 1;
        tree["center"] = point;
        return;
    } else if (tree["nw"] == undefined) {
        // external node, split it into 4 quadrants
        var sibling = tree["center"];
        BarnesHut.splitNode(tree);
        this.addPointToTreeRecursive(tree, sibling);
        this.addPointToTreeRecursive(tree, point);
    } else {
        // internal node, keep recursing
        var nwArea = tree["nw"].area;
        var neArea = tree["ne"].area;
        var swArea = tree["sw"].area;
        var inRectangle = function(point, topLeft, bottomRight) {
            return (point.x >= topLeft.x && point.x <= bottomRight.x) &&
                    (point.y <= topLeft.y && point.y >= bottomRight.y);
        };

        if (inRectangle(point.p, nwArea.topLeft, nwArea.bottomRight)) {
            this.addPointToTreeRecursive(tree["nw"], point);
        } else if (inRectangle(point.p, neArea.topLeft, neArea.bottomRight)) {
            this.addPointToTreeRecursive(tree["ne"], point);
        } else if (inRectangle(point.p, swArea.topLeft, swArea.bottomRight)) {
            this.addPointToTreeRecursive(tree["sw"], point);
        } else {
            this.addPointToTreeRecursive(tree["se"], point);
        }
    }

    // update midpoint and mass
    var midPoint = new Vector(0, 0);
    var children = [];
    BarnesHut.getChildren(tree, children);
    for (var i = 0; i < children.length; i++) {
        midPoint = midPoint.add(children[i].p);
    }
    tree["center"] = midPoint.divide(children.length);
    tree["mass"] = children.length;
};

BarnesHut.splitNode = function(node) {
    var area = node["area"];
    var subAreaRatio = area["areaRatio"] / 2.0;
    var topLeft = area["topLeft"];
    var bottomRight = area["bottomRight"];
    var width = bottomRight.x - topLeft.x;
    var height = topLeft.y -bottomRight.y;
    node["nw"] = {area : {
        areaRatio: subAreaRatio,
        topLeft: topLeft,
        bottomRight: new Vector(topLeft.x + 0.5*width, topLeft.y - 0.5*height)
    }};
    node["ne"] = {area : {
        areaRatio: subAreaRatio,
        topLeft: new Vector(topLeft.x + 0.5*width, topLeft.y),
        bottomRight: new Vector(bottomRight.x, topLeft.y - 0.5*height)
    }};
    node["sw"] = {area : {
        areaRatio: subAreaRatio,
        topLeft: new Vector(topLeft.x, topLeft.y - 0.5*height),
        bottomRight: new Vector(topLeft.x + 0.5*width, bottomRight.y)
    }};
    node["se"] = {area : {
        areaRatio: subAreaRatio,
        topLeft: new Vector(topLeft.x + 0.5*width, topLeft.y - 0.5*height),
        bottomRight: bottomRight
    }};
};

BarnesHut.getChildren = function(node, children) {
    if (Object.keys(node).length == 1) {
        // empty external node
    } else if (node["nw"] == undefined) {
        // an external node
        children.push(node["center"]);
    } else {
        // internal node, continue recursion
        var regions = ["nw", "ne", "sw", "se"];
        for (var i = 0; i < regions.length; i++) {
            children.concat(BarnesHut.getChildren(node[regions[i]], children));
        }
    }
};

BarnesHut.prototype.applyPointRepulsion = function(point) {
    this.applyPointRepulsionRecursive(point, this.root);
};

BarnesHut.prototype.applyPointRepulsionRecursive = function(point, tree) {
    if (Object.keys(tree).length == 1) {
        // empty external node
    } else if (tree["nw"] == undefined) {
        // external node
        if (!point.equals(tree["center"])) {
            point.applyCoulombsLaw(tree["center"].p, tree["mass"]);
        }
    } else {
        // internal node, approximate or continue recursion
        var s = tree["area"].areaRatio / 100;
        var d = point.p.subtract(tree["center"]).magnitude();
        if (s / d < MM.BH_THRESHOLD) {
            // approximate the effect of all children
            point.applyCoulombsLaw(tree["center"], tree["mass"]);
        } else {
            var regions = ["nw", "ne", "sw", "se"];
            for (var i = 0; i < regions.length; i++) {
                this.applyPointRepulsionRecursive(point, tree[regions[i]]);
            }
        }
    }
};
