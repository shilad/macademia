"use strict";

/**
 * A base class that encapsulates shared funcationality between
 * the query and exploration visualizations.
 */


var NbrViz = Class.extend({
    init : function(params) {
        this.paper = params.paper;
        this.width = params.width || this.paper.width;
        this.height = params.height || this.paper.height;
        this.peopleClickable = params.peopleClickable ||  false;
        this.interestWeights = {};
        this.reset();
        this.loadingMessage = $("#loadingMessage");
        this.loadingDiv = $("#loadingDiv");

        this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
        this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});
        this.fadeScreen.toBack();

        // must be initialized after macademia.nbrviz.magnet.init(), called in reset()
        this.xRange = macademia.nbrviz.magnet.X_RANGE - 0.01;
        this.yRange = macademia.nbrviz.magnet.Y_RANGE - 0.01;

        var self = this;
        $.address.change(function(event) {self.onAddressChange(event);});
    },

    reset : function() {
        this.rootId = null;
        this.rootClass = null;
        this.people = {};
        this.interestClusters = {};
        this.edges = [];
        this.highlighted = [];
        this.paper.clear();
        Magnet.clear();
        macademia.nbrviz.magnet.init(this.width, this.height);
    },

    hasRoot : function() {
        return !!this.rootClass;
    },

    setupListeners : function() {
        // Set up the event listeners
        var self = this;
        $.each(this.people, function (index, p) {
            p.hover(
                    function () { self.handlePersonHover(p); },
                    function () { self.handlePersonUnhover(p); }
                );
            p.hoverInterest(
                    function (p, i2, n) { self.handleInterestHover(p, i2, n); },
                    function (p, i2, n) { self.handleInterestUnhover(p, i2, n); }
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
        });

    },

    layoutInterests : function(json) {
        var numParents = macademia.objectSize(this.interestClusters);

        // don't count root interest if root is an interest
        if (this.rootClass == 'interest') { numParents--; }

        var index = 0;
        var self = this;
        $.each(this.interestClusters, function(i, ic) {
            self.drawInterestCluster(index, ic, numParents);
            if (!self.isRootNode(ic)) { index += 1; }
        });
    },

    drawInterestCluster : function(i, ic, numParents) {
        var center = new Point(new Vector(0, 0));
        var slice = Math.PI * 2 / numParents;
        var angle = i * slice + slice / 2 - Math.PI / 2;
        var p = (this.isRootNode(ic) || (numParents == 1 && !this.hasRoot()))
                    ? [0.0, 0.0]
                    : [Math.cos(angle) * this.xRange, Math.sin(angle) * this.yRange];
        var point = new Point(new Vector(p[0], p[1]));
        var mag = new Magnet(point.p, ic.id );
        ic.setPosition(point.screenX(), point.screenY());
        if (!this.isRootNode(ic)) {
            var spoke = this.paper.path('M' + center.screenX() + ',' + center.screenY() + ',L' + point.screenX() + ',' + point.screenY());
            spoke.attr({ stroke : '#777', 'stroke-dasharray' : '.'  });
            spoke.insertAfter(this.bg);
        }
        var r = ic.collapsedRadius;
        var c1 =  Raphael.hsb(ic.color, 0.5, 1.0);
        var c2 =  Raphael.hsb(ic.color, 0.3, 1.0);
        var g = this.paper.circle(point.screenX(), point.screenY(), r * 5)
            .attr({
                    'fill' : 'r(0.5, 0.5)' + c1 + '-' +c2 + ':30-#fff',
                    'fill-opacity' : 0.0,
                    'stroke-width': 0
             });
        g.insertAfter(this.bg);
    },

    isRootNode : function(node) {
        return node.type == this.rootClass && node.id == this.rootId;
    },

    drawBackground : function() {
        var xr = this.xRange;
        var yr = this.yRange;
        var z = macademia.nbrviz.magnet.ZOOM_CONSTANT;
        var p = new Point(new Vector(-xr, -yr));

        this.hub = this.paper.ellipse(p.screenX() + xr*z, p.screenY() + yr*z, xr * z, yr * z);
        this.hub.attr({ stroke : '#777', 'stroke-dasharray' : '.'  });
        this.hub.toBack();
        this.bg = this.paper.ellipse(p.screenX() + xr*z, p.screenY() + yr*z, xr * z * 2, yr * z * 2)
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
            var mag = new Magnet(p.p, -1);
            var c = this.paper.circle(p.screenX(), p.screenY(), 100)
                .attr({
                        'fill' : 'r(0.5, 0.5) #aaa-ccc:30-#fff',
                        'fill-opacity' : 0.0,
                        'stroke-width': 0
                 });
            c.insertAfter(this.bg);
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
        $.map(this.interestClusters, function (qi) { qi.setEnabled(enabled); });
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
            if (p == parentNode) {
                return;
            }
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
    },

    loadJson : function(model) {
        model.dump();
        this.reset();
        this.rootId = model.getRootId();
        this.rootClass = model.getRootClass();

        if (model.isEmpty()) { return; }

        var self = this;

        macademia.nbrviz.assignColors(model.getClusterIds());
        this.interests = model.getInterests();
        macademia.nbrviz.setInterests(this.interests);

        // Create interest clusters
        $.each(model.getClusterIds(), function (i, cid) {
            self.interestClusters[cid] = self.initCluster(cid, model);
        });

        // create people
        var peopleIds = model.getPeopleIds();
        if (peopleIds.length > this.maxPeopleThatFit(model)) {
            peopleIds = peopleIds.slice(0, this.maxPeopleThatFit(model));
        }
        $.each(peopleIds, function(i, pid) {
            self.people[pid] = self.initPerson(pid, model);
        });
        macademia.nbrviz.setPeople(this.people);

        this.setEnabled(false);
        this.drawBackground();
        this.layoutInterests();
        this.layoutPeople();
        this.setupListeners();
        this.loadingDiv.hide();
    },

    initCluster : function(id, model) {
        var interest = model.getInterest(id);
        var ic = new InterestCluster({
            id : id,
            interest : interest,
            interests : model.getInterests(),
            relatedInterests : model.getRelatedInterests(id),
            name : interest.name,
            color : macademia.nbrviz.getColor(id),
            paper : this.paper,
            clickText : '(click to add)'
        });
        var self = this;
        ic.clicked(function (node) { self.interestClicked(node); });
        return ic;
    },

    initPerson : function(pid, model) {
        var pinfo = model.getPerson(pid);
        var pinterests = model.getPersonInterests(pid);
        var interestGroups = model.getPersonInterestGroups(pid, this.interestClusters);
        var params = {
            relevance : pinfo.relevance,
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : this.paper,
            id : pid,
            centerActive : this.peopleClickable,
            interests : $.grep(pinterests, function(i) {return (i.relatedQueryId >= 0);}),
            nonRelevantInterests : $.grep(pinterests, function(i) {return (i.relatedQueryId < 0);}),
            collapsedRadius : 8 * model.getNormalizedPersonRelevance(pid) + 5
        };
        if (this.rootClass == 'person' && this.rootId == pid) {
            params.imageHeight = 60;
            params.collapsedRadius *= 2;
        }
        var person = new Person(params);
        if (person.interests.length > 12) {
            person.expandedRadius *= Math.sqrt(person.interests.length / 12);
        }
        if (this.rootClass == 'person' && this.rootId == pid) {
            person.expandedRadius *= 1.2;
        }
        var self = this;
        person.clicked(
                function (node) {
                    if (node.type == 'interest') { self.interestClicked(node); }
                    if (node.type == 'person') { self.personClicked(node); }
                });
        return person;
    },

    maxPeopleThatFit : function(model) {
        return Math.max(8, macademia.screenArea() / 35000) - model.getClusterIds().length;
    },
    interestClicked : function(interestNode) {
    },
    personClicked : function(personNode) {
    },

    initSlider : function(interestId) {
        var weight = 3;
        var slider = $(".interestSlider[interest=" + interestId + "]");
        if (slider.length) {
            weight = slider.slider( "option", "value" );
        } else if (interestId in this.interestWeights) {
            weight = this.interestWeights[interestId];
        }
        this.interestWeights[interestId] = weight;
    },

    getOrLookupInterestName : function(interestId) {
        if (this.interests && this.interests[interestId] && this.interests[interestId].name) {
            return this.interests[interestId].name;
        } else {
            return macademia.getInterestName(interestId);
        }
    },

    initKey : function(clusterIds) {
        alert('initKey must be overridden!');
    },

    setLoadingMessage : function(message) {
        this.loadingMessage.html(message || "loading...");
    },
    showLoadingMessage : function() {
        this.loadingDiv.show();
    },
    hideLoadingMessage : function() {
        this.loadingDiv.hide();
    },

    drawKeySphere : function(interestId) {
        var k = $(".interestKey[interest='" + interestId + "']");
        var w = k.width(), h = k.height();
        var p = new Raphael(k.get(0), w, h);
        var s = new Sphere({
            r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
            hue : macademia.nbrviz.getColor(interestId), paper : p
        });
    }
});