
macademia.nbrviz.person = macademia.nbrviz.person || {};

macademia.nbrviz.person.INTEREST_INCR = 100;

/**
 * The center for a person node (image + wedges).
 */
var PersonCenter = RaphaelComponent.extend({

    IMAGE_ASPECT : 130.0 / 194.0,
    IMAGE_WIDTH : 28,
    IMAGE_HEIGHT : 28 / (130.0 / 194.0),
    LABEL_VERT_OFFSET : 13,
    LABEL_HORIZ_OFFSET : 13,

    init : function(params) {
        this._super(params);

        // constants

        // object properties
        this.scale = params.scale || 1.0;
        this.interestGroups = params.interestGroups;
        this.imageHeight = params.imageHeight || this.IMAGE_HEIGHT;
        this.imageWidth = params.imageWidth || (this.imageHeight * this.IMAGE_ASPECT);
        this.innerRadius = params.innerRadius || this.imageHeight * .5;
        this.outerRadius = params.outerRadius || this.innerRadius + 10;
        this.maxRadius = params.maxRadius || 100000000;
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";
        this.id = params.id || -1;
        this.rotation = 0;
        this.r = this.outerRadius + this.innerRadius;
        this.glow = null;
        this.type = 'person';
        this.fakeRootNode = null;

        var x = params.x, y = params.y;

        // Avatar for the person
        this.imageBg = this.paper.circle(x, y, this.innerRadius * this.scale).attr({fill: "white"});
        this.image = this.paper.image(
                this.picture,
                x-this.imageWidth / 2 * this.scale,
                y-this.imageHeight / 2 * this.scale,
                this.imageWidth * this.scale,
                this.imageHeight * this.scale);

        // strokes and borders
        var outerR = this.scaledOuterRadius();
        this.outerStroke = this.paper.circle(x, y, this.scale * this.innerRadius + outerR)
                .attr({stroke: "#999", "stroke-width": 1});
        this.innerStroke = this.paper.circle(x, y, this.scale * this.innerRadius)
                .attr({stroke: "#999", "stroke-width": 1});

        // wedges
        var self = this;
        this.wedges = [];
        this.nameText = this.paper.text().attr({
            text: this.name,
            x: x + this.scale * this.LABEL_HORIZ_OFFSET,
            y: y + this.scale * this.innerRadius + outerR + this.LABEL_HORIZ_OFFSET,
            font: macademia.nbrviz.mainFont
        });
        this.handle = this.paper.circle(x, y, this.scale * this.innerRadius + outerR)
                .attr({fill: "#f00", opacity: 0.0}).toFront();

        // The order of the following statements is delicate...
        this.installEventHandlers();
        this.setInterestGroups(this.interestGroups);
        this.setPosition(x, y);
    },
    installEventHandlers : function() {
        this.hoverSet = new HoverSet(this.getLayers());
    },
    setOuterRadius : function(outerRadius) {
        this.outerRadius = this.scale * outerRadius;
        this.r = this.scale * (this.innerRadius + this.outerRadius);
        this.outerStroke.attr('r', this.r);
        this.handle.attr('r', this.r);

        // FIXME: update the name text appropriately.
    },
    setInterestGroups : function(interestGroups) {
        var self = this;

        // remove old arcs
        $.each(this.wedges, function() {
            self.hoverSet.remove(this);
            this.remove();
        });
        this.wedges = [];

        // add new wedges
        this.interestGroups = interestGroups;
        $.each(this.interestGroups, function() {
            var ig = this[0];
            var sat = macademia.pinch(this[1] * this[1] * this[1] / 2.0, 0.35, 0.8);
            var color = self.fillHsb(ig.color, sat);
            var section = self.paper.path().attr({stroke: color, opacity: 0});
            self.wedges.push(section);
        });

        // install listeners
        $.each(this.wedges, function() { self.hoverSet.add(this); });
    },
    getLayers : function() {
        var layers = [ this.imageBg, this.image, this.outerStroke, this.innerStroke ];
        macademia.concatInPlace(layers, this.wedges);
        layers.push(this.nameText);
        layers.push(this.handle);
        return layers.reverse();
    },
    fillHsb : function(h, s) {
        if (s) {
            return 'hsb(' + h + ',' + s + ',1)';
        } else {
            return 'hsb(' + h + ',0.4,1)';
        }
    },
    getHandle : function() { return this.handle; },
    getX : function() { return this.handle.attr('cx'); },
    getY : function() { return this.handle.attr('cy'); },
    highlightNone : function() {this.highlightOff();},
    highlightOn : function() {
        if (!this.glow) {
            this.glow = this.outerStroke.glow();
        }
    },
    highlightOff : function() {
        if (this.glow) {
            this.glow.remove();
            this.glow = null;
        }
    },
    setPosition : function(x, y) {
        var circles = [this.handle, this.innerStroke, this.outerStroke, this.imageBg];

        var k = this.scale;
        var outerR = this.scaledOuterRadius();
        $.each(circles, function() { this.attr({cx : x, cy : y}); });
        this.image.attr({
            x : (x - this.image.attr('width')/2),
            y : (y - this.image.attr('height')/2)
        });
        this.nameText.attr({
            x : (x - this.nameText.attr('width')/2),
            y : y + k * this.innerRadius + outerR + this.LABEL_HORIZ_OFFSET
        });

        var rectangles = [this.image, this.nameText];
        var self = this;
        var amount = 1.0;
        this.updateRotation()
        $.each(this.interestGroups, function(i) {
            var ig = this[0];
            var w = self.wedges[i];
            w.attr({personArc: [x, y, outerR, amount, self.rotation, k*self.innerRadius], opacity: 1});
            amount -= this[2];
        });

    },
    setScale : function(scale) {
        if (this.scale != scale) {
            this.animate({scale : scale}, 0);
            this.scale = scale;
        }
    },
    updateRotation : function() {
        var domGroup = this.dominantInterestGroup();
        var magX = domGroup.centerNode.getX();
        var magY = domGroup.centerNode.getY();
        var myX = this.getX();
        var myY = this.getY();
        var desiredAngle = Math.atan2(magY - myY, magX - myX);
        var actualAngle = 0;
        $.each(macademia.reverseCopy(this.interestGroups), function(i) {
            var ig = this[0];
            if (ig == domGroup) {
                actualAngle += this[2] / 2;
                return false;
            }
            actualAngle += this[2];
        });
        actualAngle *= Math.PI * 2;
        this.rotation = desiredAngle - actualAngle;
    },
    dominantInterestGroup : function() {
        return this.interestGroups[0][0];
    },
    animate : function(attrs) {
        this.getLayerSet().stop();
        var k = attrs.scale || 1.0;
        var x = attrs.x || attrs.cx || this.getX();
        var y = attrs.y || attrs.cy || this.getY();
        var self = this;
        $.each(this.getLayers(), function(i, l) {
            if (l != self.handle) { l.stop(); }
        });
        var ms = 200;
        this.image.animate({
            width : this.imageWidth * k,
            height : this.imageHeight * k,
            x : x - this.imageWidth * k / 2,
            y : y - this.imageHeight * k / 2
        }, ms);
        this.imageBg.animate({ r : this.innerRadius * k, cx : x, cy : y }, ms);
        this.innerStroke.animate({ cx : x, cy : y, r : this.innerRadius * k }, ms);
        var outerR = this.scaledOuterRadius(k);

        this.outerStroke.animate({ cx : x, cy : y, r : (this.innerRadius * k + outerR)}, ms);

        var self = this;
        var amount = 1.0;
        this.updateRotation();
        $.each(this.interestGroups, function(i) {
            var ig = this[0];
            var w = self.wedges[i];
            w.animate({
                personArc: [x, y, outerR, amount, self.rotation, self.innerRadius * k]
            }, ms);
            amount -= this[2];
        });
        this.nameText.animate({
            y: y+this.innerRadius * k +outerR +this.LABEL_HORIZ_OFFSET
        }, ms);
    },
    scaledOuterRadius : function(scale) {
        scale = scale || this.scale;
        var r = Math.sqrt(scale) * this.outerRadius;
        return Math.min(r, this.maxRadius - this.innerRadius * scale);
    }
});

/**
 * Person object constructor. params should have the following properties:
 * @ param collapsedRadius the size of the person, as measured by the width of the arc.
 * @ param interestGroups 2D array that determines the color slices on the person's circle by taking the proportions of his/her interestGroups.
 *         eg: [[interestGroup1, 0.3],[interestGroup2, 0.4],[interestGroup3, 0.3]]
 * @ param interests the person's interests that are related to the center  (Interest class)
 * @ param nonRelevantInterests greyed out interests that appear on mouseover that the person has but are not related to the center
 * @ param picture url to person's image
 * @ param name person's name
 * @ param paper the Raphael object you'd like to use. default is macademia.nbrviz.paper
 * @ author Emi Lim
 */
var Person = MNode.extend({
    init : function(params) {
        this.type = 'person';
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";
        this.imageHeight = params.imageHeight;
        this.setRelevance(params.relevance);
        this.setRelatedInterests(
                params.interests, params.nonRelevantInterests,
                params.interestGroups);
        this._super(params);
    },
    setRelevance : function(relevance) {
        this.relevance = relevance;
    },

    setRelatedInterests : function(newInterests, nonRelevantInterests, newInterestGroups) {
        newInterestGroups.sort(function(a,b){
            return b[1] - a[1]
        });
        this.interestGroups = newInterestGroups;
        this.interests = this.sortAndColorInterests(newInterests, newInterestGroups);
        macademia.concatInPlace(this.interests, nonRelevantInterests);
        if (this.centerNode) {
            this.centerNode.setInterestGroups(newInterestGroups);
        }
        this._super(this.interests);
    },
    sortAndColorInterests : function(interests, interestGroups){
        var sortedInterests = [];
        for (var i=0; i< interestGroups.length; i++) {
            var qi = interestGroups[i][0];
            $.each(interests, function() {
                if (this.relatedQueryId == qi.id) {
                    this.color = qi.color;
                    sortedInterests.push(this);
                }
            });
        }
        return sortedInterests;
    },
    dominantInterestGroup : function() {
        return this.interestGroups[0][0];
    },
    createCenterNode : function() {
        this.centerNode = new PersonCenter({
            interestGroups : this.interestGroups,
            name : this.name,
            picture : this.picture,
            id : this.id,
            x : this.x,
            y : this.y,
            scale : this.scale,
            imageHeight : this.imageHeight,
            outerRadius : this.collapsedRadius,
            maxRadius : this.expandedRadius - this.relatedNodeRadius * 1.5,
            paper : this.paper
        });
    },
    onHoverIn : function(ms, override) {
        this._super(ms, override);
        if (!this.enabled && !override) {
            return;
        }
        this.centerNode.animate({cx : this.newX, cy : this.newY, scale : 2.2});
        this.getHandle().stop();
        this.getHandle().animate({
                r: this.expandedHandleRadius,
                cx: this.newX,
                cy: this.newY
            }, 0, "linear");
    },
    onHoverOut : function(ms, override) {
        this._super(ms, override);
        if (!this.enabled && !override) {
            return;
        }
        this.centerNode.animate({x : this.origX, y : this.origY, scale : 1.0});
        this.getHandle().stop();
        var r = this.centerNode.outerRadius + this.centerNode.innerRadius;
        this.getHandle().animate({
                r: r,
                cx: this.origX,
                cy: this.origY
            }, 0, "linear");
    },
    setPosition : function(x, y) {
        this._super(x, y);
        // change the color of the ring.
        this.ring.attr('fill', 'hsb(0,0,.8)');
        this.centerNode.setPosition(x, y);
    },
    highlightNone : function() {
        this.highlightOff();
    }
});
