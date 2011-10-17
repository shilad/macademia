
macademia.nbrviz.person = macademia.nbrviz.person || {};

macademia.nbrviz.person.INTEREST_INCR = 100;

/**
 * The center for a person node (image + wedges).
 */
var PersonCenter = RaphaelComponent.extend({
    init : function(params) {
        this._super(params);

        // constants
        this.IMAGE_ASPECT = 130.0 / 194.0;
        this.IMAGE_WIDTH = 28;
        this.IMAGE_HEIGHT = this.IMAGE_WIDTH / this.IMAGE_ASPECT;
        this.LABEL_VERT_OFFSET = 13;
        this.LABEL_HORIZ_OFFSET = 13;

        // object properties
        this.interestGroups = params.interestGroups;
        this.imageWidth = params.imageWidth || this.IMAGE_WIDTH;
        this.imageHeight = params.imageHeight || this.IMAGE_HEIGHT;
        this.innerRadius = params.innerRadius || this.imageHeight * .5;
        this.outerRadius = params.outerRadius || this.innerRadius + 10;
        this.maxRadius = params.maxRadius || 100000000;
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";
        this.rotation = 0;

        var x = params.x, y = params.y;

        // Avatar for the person
        this.imageBg = this.paper.circle(x, y, this.innerRadius).attr({fill: "white"});
        this.image = this.paper.image(this.picture,
                x-this.imageWidth/2, y-this.imageHeight/2,
                this.imageWidth, this.imageHeight);

        // strokes and borders
        this.outerStroke = this.paper.circle(x, y, this.innerRadius+this.outerRadius).attr({stroke: "#999", "stroke-width": 1});
        this.innerStroke = this.paper.circle(x, y, this.innerRadius).attr({stroke: "#999", "stroke-width": 1});

        // wedges
        var self = this;
        this.wedges = [];
        $.each(this.interestGroups, function() {
            var ig = this[0];
            var sat = Math.max(0.25, Math.min(this[1] * this[1] * this[1] / 2, 0.8));
//            console.log(self.name + ': ' + ig.name + ' ' + sat);
            var color = self.fillHsb(ig.color, sat);
            var section = self.paper.path().attr({stroke: color, opacity: 0});
            self.wedges.push(section);
        });
        this.nameText = this.paper.text().attr({
            text: this.name,
            x: x+this.LABEL_HORIZ_OFFSET,
            y: y+this.innerRadius+this.outerRadius+this.LABEL_HORIZ_OFFSET,
            font: macademia.nbrviz.mainFont
        });
        this.handle = this.paper.circle(x, y, this.innerRadius+this.outerRadius)
                .attr({fill: "#f00", opacity: 0.0}).toFront();

        this.setPosition(x, y);

        // setup events
        this.installEventHandlers();
    },
    installEventHandlers : function() {
        this.hoverSet = new HoverSet(this.getLayers());
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
    highlightOn : function() {},
    highlightNone : function() {},
    highlightOff : function() {},
    setPosition : function(x, y) {
        var circles = [this.handle, this.innerStroke, this.outerStroke, this.imageBg];
        $.each(circles, function() { this.attr({cx : x, cy : y}); });

        this.image.attr({
            x : (x - this.image.attr('width')/2),
            y : (y - this.image.attr('height')/2)
        });
        this.nameText.attr({
            x : (x - this.nameText.attr('width')/2),
            y : y+this.innerRadius+this.outerRadius+this.LABEL_HORIZ_OFFSET
        });
        var rectangles = [this.image, this.nameText];

        var self = this;
        var amount = 1.0;
        this.updateRotation();
        $.each(this.interestGroups, function(i) {
            var ig = this[0];
            var w = self.wedges[i];
            w.attr({personArc: [x, y, self.outerRadius, amount, self.rotation, self.innerRadius], opacity: 1});
            amount -= this[2];
        });

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
        var scalingFactor = attrs.scale || 1.0;
        var x = attrs.x || attrs.cx || this.getX();
        var y = attrs.y || attrs.cy || this.getY();
        var self = this;
        $.each(this.getLayers(), function(i, l) {
            if (l != self.handle) { l.stop(); }
        });
        var ms = 200;
        this.image.animate({
            width : this.imageWidth * scalingFactor,
            height : this.imageHeight * scalingFactor,
            x : x - this.imageWidth * scalingFactor / 2,
            y : y - this.imageHeight * scalingFactor / 2
        }, ms);
        this.imageBg.animate({ r : this.innerRadius * scalingFactor, cx : x, cy : y }, ms);
        this.innerStroke.animate({ cx : x, cy : y, r : this.innerRadius * scalingFactor }, ms);
        var newOuterRadius = Math.sqrt(scalingFactor) * this.outerRadius;
        newOuterRadius = Math.min(newOuterRadius, this.maxRadius - this.innerRadius * scalingFactor);

        this.outerStroke.animate({ cx : x, cy : y, r : (this.innerRadius * scalingFactor + newOuterRadius)}, ms);

        var self = this;
        var amount = 1.0;
        this.updateRotation();
        $.each(this.interestGroups, function(i) {
            var ig = this[0];
            var w = self.wedges[i];
            w.animate({
                personArc: [x, y, newOuterRadius, amount, self.rotation, self.innerRadius * scalingFactor]
            }, ms);
            amount -= this[2];
        });
        this.nameText.animate({
            y: y+this.innerRadius * scalingFactor +newOuterRadius +this.LABEL_HORIZ_OFFSET
        }, ms);
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
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";
        this.relevance = params.relevance || null;
        this.interestGroups = params.interestGroups || [];
        this.interestGroups.sort(function(a,b){
                return b[1] - a[1]
        });
        this.interests = this.sortAndColorInterests(params.interests, params.interestGroups);
        macademia.concatInPlace(this.interests, params.nonRelevantInterests || []);
        this.relatedInterests = this.interests;
        this._super(params);
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
            x : this.x,
            y : this.y,
            outerRadius : this.collapsedRadius,
            maxRadius : this.expandedRadius - this.relatedNodeRadius * 1.5,
            paper : this.paper
        });
    },
    onHoverIn : function() {
        this._super();
        if (!this.enabled) {
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
    onHoverOut : function() {
        this._super();
        if (!this.enabled) {
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
    }
});


function Center(params){
    this.interestGroups = params.interestGroups || 0;
    this.paper = params.paper || macademia.nbrviz.paper;
    var xPos = macademia.nbrviz.paper.width/2,
        yPos = macademia.nbrviz.paper.height/2;
    macademia.nbrviz.paper.circle(xPos, yPos, 40).attr({fill: "r#fff-#000"});
    macademia.nbrviz.paper.ball(xPos, yPos, 40, "#333", "shilad", 0, 20);
    //creating conjoining connectors to interestclusters
    for (var i=0; i< this.interestGroups.length; i++){
        var color= macademia.nbrviz.makeHsb(this.interestGroups[i].color);
        this.paper.path("M"+ xPos+" "+yPos+"L"+this.interestGroups[i].xPos+ " "+this.interestGroups[i].yPos).attr({"stroke-width": 3, stroke: color}).toBack();
    }
}

