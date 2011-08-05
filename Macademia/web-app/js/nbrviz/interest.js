
macademia.nbrviz.interest = macademia.nbrviz.interest || {};

macademia.nbrviz.interest.centerRadius = 30;
macademia.nbrviz.interest.clusterRadius = 150;
macademia.nbrviz.interest.nodeRadius = 10;
macademia.nbrviz.interest.POS_NOTIFY_THRESHOLD = 50;

/**
 * Interest Cluster constructor.
 * @param params A dictionary consisting of keys:
 *  relatedInterests : a list of RelatedInterest objects.
 *  color : An integer representing hue between 0 and 1
 *  name : label for cluster or not?
 */
function InterestCluster(params) {
    this.id = params.id || null;
    this.relatedInterests = params.relatedInterests;
    this.color = params.color || 0.1;
    this.paper = params.paper || macademia.nbrviz.paper;
    this.moveListeners = [];

    if(params.name) {
        this.name = params.name;
        this.hasCenter = true;
    } else {
        this.name = this.retrieveClusterName();
        this.hasCenter = false;
    }

}

/**
 * Must be called to complete the setup of the interest cluster.
 * @param x
 * @param y
 */
InterestCluster.prototype.setPosition = function(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.lastNotifyX = x;
    this.lastNotifyY = y;

    var textOffsetX = 0,
        textOffsetY = 40,
        self = this;

    this.interest = new Sphere({
                x : this.xPos, y : this.yPos,
                r : macademia.nbrviz.interest.centerRadius,
                hue : this.color, name : this.name,
                xOffset : textOffsetX, yOffset : textOffsetY,
                paper : this.paper
            });
    this.hiddenRing = this.interest.getInvisible();
    this.hiddenRing.toFront();

    this.layers = [];
    macademia.concatInPlace(this.layers, this.interest.getLayers());

    this.relatedInterestNodes = this.createRelatedInterestNodes();
    $.each(this.relatedInterestNodes,
            function(i, ri) {macademia.concatInPlace(self.layers, ri.getLayers()); }
        );

    this.hideText();
    this.listeners();
};

InterestCluster.prototype.toFront = function() {
    this.layers[0].toFront();
    for (var i = 1; i < this.layers.length; i++) {
        this.layers[i].insertBefore(this.layers[i-1]);
    }
};

InterestCluster.prototype.getBottomLayer = function() {
    return this.ring;
};


/**
 * Takes an array of the names of related interests, finds the two shortest names and returns
 * a short string depending on the number of related interests. Ex: "interest1, interest2, ..."
 */
InterestCluster.prototype.retrieveClusterName = function() {
    var clusterName = "";
    var shortOne = "";
    var shortTwo = "";
    var self = this;

    if(this.relatedInterests.length == 1) {
        return this.relatedInterests[0].name;
    } else if(this.relatedInterests == 2) {
        shortOne = this.relatedInterests[0].name;
        shortTwo = this.relatedInterests[1].name;
    } else {
        for(var i in this.relatedInterests) {
            if((self.relatedInterests[i].name.length < shortOne.length || shortOne == "") && self.relatedInterests[i].name != "") {
                shortTwo = shortOne;
                shortOne = self.relatedInterests[i].name;
            } else if((self.relatedInterests[i].name.length < shortTwo.length || shortTwo == "") && self.relatedInterests[i].name != "") {
                shortTwo = self.relatedInterests[i].name;
            }
        }
    }
    clusterName = shortOne + ", " + shortTwo + ", ...";
    return clusterName;
};

/**
 * Creates an array of interest nodes from the list of related interests.
 */
InterestCluster.prototype.createRelatedInterestNodes = function() {

    var self = this;
    var relatedInterestNodes = [];

    $.each(self.relatedInterests, function(i) {
        var newInterestNode = new Sphere({
            x: self.xPos,
            y: self.yPos,
            r: macademia.nbrviz.interest.nodeRadius,
            hue: self.color,
            name: self.relatedInterests[i].name,
            xOffset: 0,
            yOffset: 0,
            paper: self.paper,
            font : macademia.nbrviz.subFont
        });
        newInterestNode.toBack();
        relatedInterestNodes.push(newInterestNode);
    });
    return relatedInterestNodes;
};

InterestCluster.prototype.hoverInterest = function(mouseIn, mouseOut) {
    var self = this;
    $.each(this.relatedInterestNodes, function(i, n) {
        n.hover(
                function () { mouseIn(self.relatedInterests[i], n); },
                function () { mouseOut(self.relatedInterests[i], n); }
        );
    });
};

InterestCluster.prototype.hover = function(mouseoverCallback, mouseoutCallback) {
    this.hoverSet.hover(mouseoverCallback, mouseoutCallback);
};

/**
 * Hides the text element of each related interest node
 */
InterestCluster.prototype.hideText = function() {
    $.each(this.relatedInterestNodes, function(i, node) {
        node.elements[2].hide();
    });
};

/**
 * Shows the text element of each related interest node
 */
InterestCluster.prototype.showText = function() {
    $.each(this.relatedInterestNodes, function(i, node) {
        node.elements[2].show();
    });
};

InterestCluster.prototype.listeners = function() {
    this.ring = macademia.nbrviz.paper.circle(this.interest.getX(), this.interest.getY(), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + this.color + ", 1, .75)"});
    this.layers.push(this.ring);

    if(this.hasCenter) {
        this.dragInterest();
    }
    this.hoverSet = new HoverSet();
    this.hoverSet.addAll(this.layers);
    var self = this;
    this.hoverSet.hover(
        function() {
            self.cancelAnimations();
            self.hiddenRing.animate({
                r: macademia.nbrviz.interest.clusterRadius + macademia.nbrviz.interest.nodeRadius * 2,
                x: self.xPos - macademia.nbrviz.interest.clusterRadius - macademia.nbrviz.interest.nodeRadius * 2,
                y: self.yPos - macademia.nbrviz.interest.clusterRadius - macademia.nbrviz.interest.nodeRadius * 2,
                width: macademia.nbrviz.interest.clusterRadius * 2 + macademia.nbrviz.interest.nodeRadius * 4,
                height: macademia.nbrviz.interest.clusterRadius * 2 + macademia.nbrviz.interest.nodeRadius * 4
            }, 0, "linear");
            self.placeRelatedInterests();
            self.ring.animate({r: macademia.nbrviz.interest.clusterRadius}, 800, "elastic");
            if(!self.hasCenter) {
                self.interest.elements[2].hide();
            }
        },
        function() {
            self.cancelAnimations();
            self.hideRelatedInterests();
            self.hiddenRing.animate({
                r: 0,
                x: self.xPos - macademia.nbrviz.interest.centerRadius,
                y: self.yPos - macademia.nbrviz.interest.centerRadius,
                width: macademia.nbrviz.interest.centerRadius * 2,
                height: macademia.nbrviz.interest.centerRadius * 2 + 20
            });
            self.ring.animate({r: 0}, 400, "backIn");
            if(!self.hasCenter) {
                self.interest.elements[2].show();
            }
        });
};

InterestCluster.prototype.dragInterest = function() {
    var self = this;
    var start = function () {
        // storing original coordinates
        $.each(self.relatedInterestNodes, function(i) {
            for(var k = 0; k < self.relatedInterestNodes[i].length; k++) {
                self.relatedInterestNodes[i][k].hide();
            }
        });
        self.ring.hide();
        $.each(self.relatedInterestNodes, function(i, ri) {
            ri.invisible.hide();
            $.each(ri.elements, function(i, elem) {
                elem.hide();
            });
        });
        self.interest.savePosition();
    },
    move = function (dx, dy) {
        self.interest.updatePosition(dx, dy);
        self.notifyMoveListeners();
    },
    up = function () {
        self.xPos = self.interest.getX();
        self.yPos = self.interest.getY();
        $.each(self.relatedInterestNodes, function(i, ri) {
            ri.invisible.show();
            $.each(ri.elements, function(i, elem) {
                elem.show();
            });
        });
        self.placeRelatedInterests();
        self.ring.attr({cx: self.xPos, cy: self.yPos});
        self.ring.show();
        self.notifyMoveListeners();
    };

    this.interest.drag(move, start, up);
};

InterestCluster.prototype.notifyMoveListeners = function() {
    var x = this.interest.getX();
    var y = this.interest.getY();
    if (Math.abs(this.lastNotifyX - x) + Math.abs(this.lastNotifyY - y) >= macademia.nbrviz.interest.POS_NOTIFY_THRESHOLD) {
        this.lastNotifyX = x;
        this.lastNotifyY = y;
        for (var i = 0; i < this.moveListeners.length; i++) {
            this.moveListeners[i](this, x, y);
        }
    }
};

/**
 * Add an event handler that is called after the interest is moved.
 * The handler will be called with three arguments: interestCluster, x, y
 * @param onMove
 */
InterestCluster.prototype.onMove = function(onMove) {
    this.moveListeners.push(onMove);
};

InterestCluster.prototype.placeRelatedInterests = function() {
    var positions = macademia.nbrviz.calculateRelatedInterestPositions(this.relatedInterests, macademia.nbrviz.interest.clusterRadius, this.xPos, this.yPos);
    var nodePositions = positions[0];
    var textPositions = positions[1];

    var self = this;
    $.each(this.relatedInterestNodes, function(i, ri){
        ri.invisible.animate({
            x: nodePositions[i][0] - macademia.nbrviz.interest.nodeRadius,
            y: nodePositions[i][1] - macademia.nbrviz.interest.nodeRadius
        });
        for(var j = 0; j <= 1; j++) {
            ri.elements[j].show();
            ri.elements[j].animate({
                cx: nodePositions[i][0],
                cy: nodePositions[i][1]
            }, 800, "elastic");
        }
        ri.elements[2].show();
        ri.elements[2].animate(
                {x: textPositions[i][0], y: textPositions[i][1]},
                800,
                "elastic",
                function () { ri.toFront(); }
        );
    });
};

InterestCluster.prototype.cancelAnimations = function() {
    this.ring.stop();
    this.hiddenRing.stop();
    var self = this;
    $.each(this.relatedInterestNodes, function(i, ri){
        for(var j = 0; j < ri.length; j++) {
            ri[j].stop();
        }
    });
};

InterestCluster.prototype.hideRelatedInterests = function() {
    var self = this;
    $.each(this.relatedInterestNodes, function(i, ri){
        self.hideText();
        ri.invisible.animate({
            x: self.xPos - macademia.nbrviz.interest.nodeRadius,
            y: self.yPos - macademia.nbrviz.interest.nodeRadius
        });
        ri.toBack();
        for(var j = 0; j <=1; j++) {
            ri.elements[j].animate({
                cx: self.xPos,
                cy: self.yPos
            }, 400, "backIn");
            ri.elements[ri.elements.length  - 1].animate({x: self.xPos, y: self.yPos}, 400, "backIn");
        }
    });
};

/**
 * relatedInterest object constructor
 * @ param color of the relatedInterest (a hue between 0 and 1)
 * @ author Emi Lim
 */
function Interest(params) {
    this.id = params.id;
    this.name = params.name;
    this.color = params.color;
}