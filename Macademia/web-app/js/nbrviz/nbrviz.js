/**
 * A base class that encapsulates shared funcationality between
 * the query and exploration visualizations.
 */

var NbrViz = RaphaelComponent.extend({
    init : function(params) {
        this._super(params);

        // only if the viz is rooted
        this.rootId = params.rootId;
        this.rootClass = params.rootClass;

        this.people = params.people;
        this.interestClusters = params.interestClusters;
        this.paper = params.paper;
        this.edges = [];
        this.highlighted = [];

        this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
        this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});
        this.fadeScreen.toBack();

    },

    hasRoot : function() {
        return this.rootClass;
    },

    setupListeners : function() {
        // Set up the event listeners
        var self = this;
        $.each(this.people, function (index, p) {
            p.hover(
                    function () { self.handlePersonHover(p); },
                    function () { self.handlePersonUnhover(p); }
                );
        });
        $.each(this.interestClusters, function (index, i) {
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

    },

    layoutInterests : function(json) {
        var xr = macademia.nbrviz.magnet.X_RANGE - 0.01;
        var yr = macademia.nbrviz.magnet.Y_RANGE - 0.01;

        // layout up to four magnets "by hand." minus 1 because of root
        var self = this;
        var index = 0;
        var center = new Point(new Vector(0, 0));
        var z = macademia.nbrviz.magnet.ZOOM_CONSTANT;

        var numParents = this.interestClusters.length;
        // don't count root interest if root is an interest
        if (this.rootClass == 'interest') { numParents--; }
        console.log('numParents is ' + numParents);

        $.each(this.interestClusters, function(i, ic) {
            var slice = Math.PI * 2 / numParents;
            var angle = index * slice + slice / 2 - Math.PI / 2;
            var p = (self.rootClass == 'interest' && ic.id == self.rootId)
                        ? [0.0, 0.0]
                        : [Math.cos(angle) * xr, Math.sin(angle) * yr];
            var point = new Point(new Vector(p[0], p[1]));
            var mag = new Magnet(point.p, ic.id );
            ic.setPosition(point.screenX(), point.screenY());
            if (ic.id != self.rootId) {
                index += 1;
                var spoke = this.paper.path('M' + center.screenX() + ',' + center.screenY() + ',L' + point.screenX() + ',' + point.screenY());
                spoke.attr({ stroke : '#ccc', 'stroke-dasharray' : '.'  });
                spoke.toBack();
            }
            var r = ic.collapsedRadius;
            var c1 =  Raphael.hsb(ic.color, 0.5, 1.0);
            var c2 =  Raphael.hsb(ic.color, 0.3, 1.0);
            this.paper.circle(point.screenX(), point.screenY(), r * 5)
                .attr({
                        'fill' : 'r(0.5, 0.5)' + c1 + '-' +c2 + ':30-#fff',
                        'fill-opacity' : 0.0,
                        'stroke-width': 0
                 })
                .toBack();
        });

        // create "fake" repulsive magnet at center
        if (this.rootClass == 'person') {
            p = new Point(new Vector(0, 0));
            var mag = new Magnet(p.p, -1);
            this.paper.circle(p.screenX(), p.screenY(), 100)
                .attr({
                        'fill' : 'r(0.5, 0.5) #aaa-ccc:30-#fff',
                        'fill-opacity' : 0.0,
                        'stroke-width': 0
                 })
                .toBack();
        }

        var p = new Point(new Vector(-xr, -yr));
        this.hub = this.paper.ellipse(p.screenX() + xr*z, p.screenY() + yr*z, xr * z, yr * z);
        this.hub.attr({ stroke : '#ccc', 'stroke-dasharray' : '.'  });
        this.hub.toBack();
        var bg = this.paper.ellipse(p.screenX() + xr*z, p.screenY() + yr*z, xr * z * 2, yr * z * 2)
                .attr('fill', 'r(0.5, 0.5)#fff-#fff:30%-#EEE:50%-#DDD:100')
                .attr('stroke-width', 0)
                .toBack();
    },

    layoutPeople : function() {
        var self = this;

        // handle root specially if necessary.
        if (this.rootClass == 'person') {
            var p = new Point(new Vector(0, 0));
            this.people[this.rootId].setPosition( p.screenX(), p.screenY());
        }

        // initial layout around dominant magnet
        var angles = {};
        $.each(Magnet.magnets, function (i, m) { angles[m.id] = 0.5; });
        $.each(this.people, function(i, person) {
            if (self.rootClass == 'person' && i == self.rootId) {
                return; // skip the root (it's fixed)
            }
            var ic = person.dominantInterestGroup();
            var m = Magnet.findById(ic.id);
            var d = MM.OPTIMAL_MAGNET_PERSON_DIST;
            var x = m.p.x + d * Math.cos(angles[ic.id]) + 0.25 - 0.5 * Math.random();
            var y = m.p.y + d * Math.sin(angles[ic.id]) + 0.25 - 0.5 * Math.random();
            var p = new Point(new Vector(
                    macademia.pinch(x, -MM.X_RANGE, MM.X_RANGE),
                    macademia.pinch(y, -MM.Y_RANGE, MM.Y_RANGE)
            ));
            p.setStuff(i, person.relevance );
            angles[ic.id] += 1.1;
        });

        $.each(Point.points, function(index, p) {
            self.people[p.id].setPosition( p.screenX(), p.screenY());
        });

        var iters = 0;
        var f = function() {
            var k = 1.0;
            var n = Math.min(5, 1 + iters / 7);
            for (var i = 0; i < n; i++) {
                k = Math.min(k, macademia.nbrviz.magnet.oneLayoutIteration());
            }
            $.each(Point.points, function(index, p) {
                var person = self.people[p.id];
                person.setPosition(p.screenX(), p.screenY());
            });
            if (iters++ < 23 && k >= 0.00001) {
                window.setTimeout(f, 1);
            } else {
                console.log('stoppped at iters=' + iters + ', k=' + k);
                self.setEnabled(true);
            }
        };
        $.each(Point.points, function(index, p) {
            self.people[p.id].setPosition( p.screenX(), p.screenY());
        });
        window.setTimeout(f, 1);
    },

    setEnabled : function(enabled) {
        $.map(this.people, function (p) { p.setEnabled(enabled); });
        this.interestClusters.map(function (qi) { qi.setEnabled(enabled); });
    },

    raiseScreen : function(focus) {
        this.fadeScreen.stop();
        this.fadeScreen.insertBefore(focus);
        this.fadeScreen.animate({opacity : 0.70}, 400);
    },

    lowerScreen : function() {
        this.fadeScreen.stop();
        var self = this;
        this.fadeScreen.animate({opacity : 0.0}, 200, function () {self.fadeScreen.toBack();});
    },


    handlePersonHover : function(person) {
        person.toFront();
        this.raiseScreen(person.getBottomLayer());
    },

    handlePersonUnhover : function(person) {
        this.lowerScreen();
    },

    handleInterestClusterHover : function(interest) {
//    console.log("handle interest cluster hover: " + interest.name);
        interest.toFront();
        this.raiseScreen(interest.getBottomLayer());
    },

    handleInterestClusterUnhover : function(interest) {
    //    console.log("handle interest cluster unhover" + interest.name);
        this.lowerScreen();
        this.hideEdges();
    },


    handleInterestHover : function(parentNode, interest, interestNode) {
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
    },

    handleInterestUnhover : function(parentNode, interest, interestNode) {
    //    console.log("handle interest unhover" + interest.name);
        this.hideEdges();
    },

    drawEdge : function(parentNode, person, interestNode) {
        var svgStr = 'M' + interestNode.getX() + ' ' + interestNode.getY() + 'L' + person.x + ' ' + person.y + 'Z';
        var path = this.paper.path(svgStr);
        path.insertBefore(parentNode.getBottomLayer());
        path.attr({stroke : '#f00', 'stroke-width' : 2, 'stroke-dasharray' : '- ', 'stroke-opacity' : 0.2});
        this.edges.push(path);
    },

    hideEdges : function() {
        var self = this;
        $.each(this.edges, function (i, e) { e.remove(); });
        this.edges = [];
        $.each(this.highlighted, function (i, e) { e.toFront(self.fadeScreen); });
        this.highlighted = [];
    }

});