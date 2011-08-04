//var width = $(document).width()-50;
//var height = $(document).height()-50;
zoom = 30;

GRAVITATIONAL_CONSTANT = 500000.0;
q = 25000.0;

function Point(position) {
	this.p = position; // position
	//this.m = 10.0; // mass
	this.v = new Vector(0, 0); // velocity
	this.f = new Vector(0, 0); // force

	Point.points.push(this);
}
Point.points = [];

Point.prototype.setStuff= function( id, relevance ) {
	this.relevance = relevance;
	this.id = id;
};

Point.prototype.applyForce = function(force) {
	this.f = this.f.add(force);
};

// points are slightly repulsed by other points
Point.applyCoulombsLaw = function() {
	var ke = 100.0; // repulsion constant

	Point.points.forEach(function(point1) {
		Point.points.forEach(function(point2) {
			if (point1 !== point2)
			{
				var d = point1.p.subtract(point2.p);
				var distance = d.magnitude() + 1.0;
				var direction = d.normalise();

				// apply force to each end point
				point1.applyForce(direction.multiply(ke).divide(distance * distance * 0.5));
				point2.applyForce(direction.multiply(ke).divide(distance * distance * -0.5));
			}
		});
	});
};

Point.updateVelocity = function(timestep) {
	var damping = 0.5; // damping constant, points lose velocity over time
	Point.points.forEach(function(p) {
		p.v = p.v.add(p.f.multiply(timestep)).multiply(damping);
		p.f = new Vector(0,0);
	});
};

Point.updatePosition = function(timestep) {
	Point.points.forEach(function(p) {
		p.p = p.p.add(p.v.multiply(timestep));
	});
};

// convert point to screen coordinates
Point.prototype.screenX = function() {
	return this.p.x * zoom + width/2.0;
};

Point.prototype.screenY = function() {
	return this.p.y * zoom + height/2.0;
};

Magnet.prototype.constructor = Magnet;
function Magnet(position, id) {
	this.point = new Point(position);
    //this.point.m = 500.0;
	this.id = id;
	this.relevances = {};
	
	Point.points.pop();
	Magnet.magnets.push(this);
}

Magnet.magnets = [];

Magnet.prototype.computeDistance = function(pnt) {
    /*if( isNaN(pnt.screenX()) ) {
        alert("fail1");
        alert(pnt);
        alert(pnt.p);
    }
    if( isNaN(pnt.screenY()) ) {
        alert("fail2");
    }*/
	return Math.sqrt( Math.pow((this.point.p.x - pnt.screenX() ),2) + Math.pow((this.point.p.y - pnt.screenY() ),2) );
};

Magnet.prototype.forceDirection = function(pnt) {
	return (new Vector( (-this.point.p.x + pnt.screenX()), (-this.point.p.y + pnt.screenY() ) )).normalise();
};

Magnet.prototype.attractPeople = function() {
	var self = this;
	$.each(Point.points, function(i, p){
		var radius = self.computeDistance(p);
		/*if( (radius == 0) || (self.relevances[p.id] == null) ) {
			console.log(p.id + "null relevnace");
            return true;
		}
        if( isNaN(self.relevances[p.id]) ) {
            alert("fail");
        }
        if( isNaN(radius) ) {
            alert("failure "+p.id);
        }*/

        var gForce = self.forceDirection(p).multiply(
			(/* self.relevances[p.id] * */(-1.0) * GRAVITATIONAL_CONSTANT )
		).add(
			self.forceDirection(p).multiply(
				( q / Math.pow((radius/15.0),4) )
			)
		);
		p.applyForce( gForce );
	});
};

Magnet.prototype.normalizeRelevances = function() {
	var self = this;
	var sum = 0;
	Point.points.forEach(function(p){
        if ( p.relevance[self.id] != null ) { //TODO contains
            self.relevances[p.id] = p.relevance[self.id];
            sum += p.relevance[self.id];
        }
	});
	$.each(self.relevances, function(key,value) {
		self.relevances[key] = value/sum;
	});
};

function startLayout() {
    Magnet.magnets.forEach(function(mag){
        mag.normalizeRelevances();
    });
    var count =0;
	while (true) {
        Magnet.magnets.forEach(function(mag){
			mag.attractPeople();
		});
        count++;
		Point.applyCoulombsLaw();
		Point.updateVelocity(0.05);
		Point.updatePosition(0.05);

		// calculate kinetic energy of system
		var k = 0.0;
		Point.points.forEach(function(p){
			var speed = p.v.magnitude();
			k += speed * speed;
		});

		// stop simulation when
		if ( k < 0.01 || count == 100) {
			Point.points.forEach(function(p){
				console.log(p.id+", "+p.screenX()+", "+p.screenY());
			});
			console.log("done");
			break;
		}
	}
}