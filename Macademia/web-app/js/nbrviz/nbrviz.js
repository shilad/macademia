"use strict";

/**
 * A base class that encapsulates shared funcationality between
 * the query and exploration visualizations.
 */


var NbrViz = Class.extend({


    ROOT_INTEREST_SCALE : 1.4,
    ROOT_PERSON_SCALE : 1.8,

    init : function(params) {
        this.x = params.x;
        this.y = params.y;
        this.width = params.width;
        this.height = params.height;
        this.vizWidth = params.vizWidth || this.width;
        this.vizHeight = params.vizHeight || this.height;
        this.zIndex = 0;
        this.spokes = [];
        this.clusterShadows = [];
        this.enabled = false;

        this.peopleClickable = params.peopleClickable ||  false;
        this.interestWeights = {};

        macademia.nbrviz.magnet.init(this.vizWidth, this.vizHeight);

        // must be initialized after macademia.nbrviz.magnet.init(), called in reset()
        this.xRange = macademia.nbrviz.magnet.X_RANGE - 0.01;
        this.yRange = macademia.nbrviz.magnet.Y_RANGE - 0.01;

        this.createNewPaper();
        this.reset();
        this.drawBackground();

        this.loadingMessage = $("#loadingMessage");
        this.loadingDiv = $("#loadingDiv");


        var self = this;
        $.address.change(function(event) {self.onAddressChange(event);});
    },

    reset : function() {
        this.oldPeople = this.people || {};
        this.oldInterestClusters = this.interestClusters || {};
        this.oldRootId = this.rootId || {};
        this.oldRootClass = this.rootClass || {};

        this.rootId = null;
        this.rootClass = null;
        this.people = {};
        this.interestClusters = {};
        this.edges = [];
        this.highlighted = [];
//        this.paper.clear();
        Magnet.clear();
    },

    hasRoot : function() {
        return !!this.rootClass;
    },

    /**
     * TODO : remove this if necessary.
     */
    createNewPaper : function() {
        this.paper = new Raphael(this.x, this.y, this.width, this.height);
        this.paper.canvas.style.zIndex = this.zIndex++;
        this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
        this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});
        this.fadeScreen.toBack();
        this.paper.customAttributes.personArc = function(xPos, yPos, strokeWidth, percentage, rotation, innerCircle) {
            var angle = Math.PI * 2 * percentage,
                radius = innerCircle+strokeWidth/2,
                x0 = xPos + radius * Math.cos(rotation),
                y0 = yPos + radius * Math.sin(rotation),
                x1 = xPos + radius * Math.cos(rotation + angle),
                y1 = yPos + radius * Math.sin(rotation + angle),
                path;
            var largeArc = (angle > Math.PI) ? 1 : 0;
            if (percentage == 1) {
                // tricky to draw a closed arc...
                path = [["M", xPos + radius, yPos],
                    ["A", radius, radius, 0, 1, 1, xPos - radius, yPos],
                    ["A", radius, radius, 0, 1, 1, xPos + radius, yPos]
                ];
            } else {
                path = [["M", x0, y0], ["A", radius, radius, 0, largeArc, 1, x1, y1]];
            }

            return {path: path, "stroke-width": strokeWidth};
        };
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

    layoutInterests : function() {
        var positions = this.calculatePositions();
        for (var iid in positions) {
            this.drawInterestCluster(this.interestClusters[iid], positions[iid]);
        }
    },

    calculatePositions : function() {
        var numParents = macademia.objectSize(this.interestClusters);

        // don't count root interest if root is an interest
        if (this.rootClass == 'interest') { numParents--; }

        // special case: if there's only one interest it should be centered.
        if (numParents == 1 && !this.hasRoot()) {
            for (var iid in this.interestClusters) {
                return { iid : this.getCenterPosition() };
            }
        }

        var slice = Math.PI * 2 / numParents;
        var positions = {};
        var index = 0;
        for (iid in this.interestClusters) {
            var ic = this.interestClusters[iid];
            if (this.isRootNode(ic)) {
                positions[iid] = this.getCenterPosition();
            } else {
                var angle = index * slice + slice / 2 - Math.PI / 2;
                positions[iid] = this.getSpokePosition(angle);
                index += 1;
            }
        }

        // swap the previous root into the lower left
        if (this.oldRootId in this.interestClusters) {
            var lowerLeft =  this.getSpokePosition(Math.PI * 5 / 4);
            var closestId = -1;
            var closestDistance = 10000000000000000000;
            for (iid in positions) {
                var point = positions[iid];
                var d = point.p.subtract(lowerLeft.p).magnitude();
                if (d < closestDistance) {
                    closestDistance = d;
                    closestId = iid;
                }
            }
            if (closestId != this.oldRootId) {
                var tmp = positions[closestId];
                positions[closestId] = positions[this.oldRootId];
                positions[this.oldRootId] = tmp;
            }
        }

        return positions;
    },

    drawInterestCluster : function(ic, point) {
        var center = this.getCenterPosition();
        var mag = new Magnet(point.p, ic.id );
        ic.setPosition(point.screenX(), point.screenY());
        if (!this.isRootNode(ic)) {
            var spoke = this.paper.path('M' + center.screenX() + ',' + center.screenY() + ',L' + point.screenX() + ',' + point.screenY());
            spoke.attr({ stroke : '#777', 'stroke-dasharray' : '.'  });
            spoke.insertAfter(this.bg);
            this.spokes.push(spoke);
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
        this.clusterShadows.push(g);
    },

    getSpokePosition : function(angle) {
        var x = Math.cos(angle) * this.xRange;
        var y = - Math.sin(angle) * this.yRange;
        return new Point(new Vector(x, y));
    },

    getCenterPosition : function() {
        return new Point(new Vector(0, 0));
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
            this.clusterShadows.push(c);
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
        this.enabled = enabled;
        if (enabled) {
            this.lowerScreen();
        }
    },

    raiseScreen : function(focus, opacity) {
        this.fadeScreen.stop();
        if (focus) {
            this.fadeScreen.insertBefore(focus);
        } else {
            this.fadeScreen.toFront();
        }
        this.fadeScreen.animate({opacity : (opacity || 0.70)}, 400);
    },

    lowerScreen : function() {
        this.fadeScreen.stop();
        var self = this;
        this.fadeScreen.animate({opacity : 0.0}, 200, function () {self.fadeScreen.toBack();});
    },


    handlePersonHover : function(person) {
        if (!this.enabled) { return; }
        person.toFront();
        this.raiseScreen(person.getBottomLayer());
    },

    handlePersonUnhover : function(person) {
        if (!this.enabled) { return; }
        this.lowerScreen();
    },

    handleInterestClusterHover : function(interest) {
        if (!this.enabled) { return; }
//    console.log("handle interest cluster hover: " + interest.name);
        interest.toFront();
        this.raiseScreen(interest.getBottomLayer());
    },

    handleInterestClusterUnhover : function(interest) {
        if (!this.enabled) { return; }
    //    console.log("handle interest cluster unhover" + interest.name);
        this.lowerScreen();
        this.hideEdges();
    },


    handleInterestHover : function(parentNode, interest, interestNode) {
        if (!this.enabled) { return; }
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
        if (!this.enabled) { return; }
    //    console.log("handle interest unhover" + interest.name);
        this.hideEdges();
    },

    resetAllHovers : function(clicked) {
        this.hideEdges();
        this.hideLoadingMessage();
        this.lowerScreen();
        var collapse = function(node) {
            if (node.state && (node.state == MNode.STATE_EXPANDED || node.state == MNode.STATE_EXPANDING)) {
                node.stop();
                node.collapse();
            }
        };
        $.map(this.people, collapse);
        $.map(this.interestClusters, collapse);
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

    removeOldNodes : function(model) {
        $.each(this.clusterShadows.concat(this.spokes),
                function () { this.fadeAndRemove(500); }
            );
        var oldNodes = [];
        for (var iid in this.oldInterestClusters) {
            if (!model.hasParentInterest(iid)) {
                oldNodes.push(this.oldInterestClusters[iid]);
            }
        }
        for (var pid in this.oldPeople) {
            if (!model.hasPerson(pid)) {
                oldNodes.push(this.oldPeople[pid]);
            }
        }
        $.each(oldNodes, function() {
            $.each(this.getLayers(), function() { this.fadeAndRemove(500); });
        });
        this.spokes = [];
        this.clusterShadows = [];
    },
    loadJson : function(model) {
        model.dump();
        this.reset();
        this.removeOldNodes(model);
        this.rootId = model.getRootId();
        this.rootClass = model.getRootClass();

        if (model.isEmpty()) { return; }

        var self = this;

        macademia.nbrviz.colors.assign(model.getClusterIds());
        this.interests = model.getInterests();
        macademia.nbrviz.setInterests(this.interests);

        // Create interest clusters
        $.each(model.getClusterIds(), function (i, cid) {
            self.initCluster(cid, model);
        });

        // create people
        var peopleIds = model.getPeopleIds();
        if (peopleIds.length > this.maxPeopleThatFit(model)) {
            peopleIds = peopleIds.slice(0, this.maxPeopleThatFit(model));
        }
        $.each(peopleIds, function(i, pid) {
            self.initPerson(pid, model);
        });
        macademia.nbrviz.setPeople(this.people);

        this.setEnabled(false);
        this.layoutInterests();
        this.layoutPeople();
        this.setupListeners();
        this.hideLoadingMessage();
    },

    initCluster : function(id, model) {
        var interest = model.getInterest(id);
        var params = {
                id : id,
                interest : interest,
                interests : model.getInterests(),
                relatedInterests : model.getRelatedInterests(id),
                name : interest.name,
                color : macademia.nbrviz.colors.getColor(id),
                paper : this.paper,
                scale : 1.0,
                clickText : '(click to add)'
            };
        if (this.rootClass == 'interest' && this.rootId == id) {
            params.scale = this.ROOT_INTEREST_SCALE;
        }

        var ic = this.oldInterestClusters[id];
        if (ic) {
            ic.stop();
            ic.setRelatedInterests(model.getRelatedInterests(id));
            ic.setScale(params.scale);
        } else {
            ic = new InterestCluster(params);
        }
        var self = this;
        ic.clicked(function (node) { self.interestClicked(node); });
        this.interestClusters[id] = ic;
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
            scale : 1.0,
            id : pid,
            centerActive : this.peopleClickable,
            interests : $.grep(pinterests, function(i) {return (i.relatedQueryId >= 0);}),
            nonRelevantInterests : $.grep(pinterests, function(i) {return (i.relatedQueryId < 0);}),
            collapsedRadius : 8 * model.getNormalizedPersonRelevance(pid) + 5
        };
        if (this.rootClass == 'person' && this.rootId == pid) {
            params.scale = this.ROOT_PERSON_SCALE;
        }
        var person = this.oldPeople[pid];
//        person = null;
        if (person) {
            person.stop();
            person = this.oldPeople[pid];
            person.setScale(params.scale);
            person.setRelevance(params.relevance);
            person.setRelatedInterests(params.interests, params.nonRelevantInterests, params.interestGroups);
        } else {
            person = new Person(params);
        }
        if (person.interests.length > 12) {
            person.expandedRadius *= Math.sqrt(person.interests.length / 12);
        }
        if (this.rootClass == 'person' && this.rootId == pid) {
            person.expandedRadius *= 1.2;
        }
        if (!this.oldPeople[pid]) {
            var self = this;
            person.clicked(
                    function (node) {
                        if (node.type == 'interest') { self.interestClicked(node); }
                        if (node.type == 'person') { self.personClicked(node); }
                    });
        }
        this.people[pid] = person;
    },

    getInterestClusterIds : function() {
        return $.map(this.interestClusters, function (v, k) { return k; });
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
        this.loadingMessage.show();
    },
    hideLoadingMessage : function() {
        this.loadingDiv.hide();
        this.loadingMessage.hide();
    },

    drawKeySphere : function(sphereElem, interestId) {
        var w = sphereElem.width(), h = sphereElem.height();
        var p = new Raphael(sphereElem.get(0), w, h);
        var s = new Sphere({
            r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
            hue : macademia.nbrviz.colors.getColor(interestId), paper : p
        });
        return p;
    }
});