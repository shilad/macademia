
macademia.nbrviz.interest = macademia.nbrviz.interest || {};

macademia.nbrviz.interest.centerRadius = 30;
macademia.nbrviz.interest.clusterRadius = 150;
macademia.nbrviz.interest.nodeRadius = 10;

/**
 * Interest Cluster constructor.
 * @param params A dictionary consisting of keys:
 *  relatedInterests : a list of RelatedInterest objects.
 *  color : An integer representing hue between 0 and 1
 *  name : label for cluster or not?
 */
function InterestCluster(params) {
    this.relatedInterests = params.relatedInterests;
    this.color = params.color || 0.1;
    this.paper = params.paper || macademia.nbrviz.paper;

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
    this.triggerSet = this.paper.set();
    this.triggerSet.push(this.interest.getVisibleElements(), this.hiddenRing);

    this.relatedInterestNodes = this.createRelatedInterestNodes();
    $.each(this.relatedInterestNodes,
            function(i, ri) {macademia.concatInPlace(self.layers, ri.getLayers()); }
        );

    this.hideText();
    this.listeners();
    this.layers.push(this.ring);
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
        newInterestNode.invisible.toBack();
        self.triggerSet.push(newInterestNode.invisible);
        $.each(newInterestNode.elements, function(j) {
           newInterestNode.elements[j].toBack();
           self.triggerSet.push(newInterestNode.elements[j]);
        });
        relatedInterestNodes.push(newInterestNode);
    });
    return relatedInterestNodes;
};

/*
InterestCluster.prototype.hoverInterest = function(relatedInterestNodes) {
    var self = this;
    $.each(relatedInterestNodes, function(i) {
        $.each(relatedInterestNodes[i], function(j) {
            relatedInterestNodes[i][j].toFront();
            relatedInterestNodes[i][j].hover(function() {
            }, function() {
            });
        });
    });
};
*/

InterestCluster.prototype.hover = function(mouseoverCallback, mouseoutCallback) {
    this.hiddenRing.hover(mouseoverCallback, mouseoutCallback);
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
    this.triggerSet.push(this.ring);

    if(this.hasCenter) {
        this.dragInterest();
    }
    var self = this;
    this.hiddenRing.mouseover(function() {
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
    });
    this.hiddenRing.mouseout(function() {
        self.cancelAnimations();
        self.hiddenRing.animate({
            r: 0,
            x: self.xPos - macademia.nbrviz.interest.centerRadius,
            y: self.yPos - macademia.nbrviz.interest.centerRadius,
            width: macademia.nbrviz.interest.centerRadius * 2,
            height: macademia.nbrviz.interest.centerRadius * 2 + 20
        });
        self.hideRelatedInterests();
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
    };

    this.interest.drag(move, start, up);
};

InterestCluster.prototype.placeRelatedInterests = function() {
    var positions = macademia.nbrviz.calculateRelatedInterestPositions(this.relatedInterests, macademia.nbrviz.interest.clusterRadius, this.xPos, this.yPos);
    var nodePositions = positions[0];
    var textPositions = positions[1];

    var self = this;
    $.each(this.relatedInterestNodes, function(i){
        self.relatedInterestNodes[i].invisible.animate({
            x: nodePositions[i][0] - macademia.nbrviz.interest.nodeRadius,
            y: nodePositions[i][1] - macademia.nbrviz.interest.nodeRadius
        });
        for(var j = 0; j <= 1; j++) {
            self.relatedInterestNodes[i].elements[j].show();
            self.relatedInterestNodes[i].elements[j].animate({
                cx: nodePositions[i][0],
                cy: nodePositions[i][1]
            }, 800, "elastic");
        }
        self.relatedInterestNodes[i].elements[2].show();
        self.relatedInterestNodes[i].elements[2].animate({x: textPositions[i][0], y: textPositions[i][1]}, 800, "elastic");
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
        ri.invisible.animate({
            x: self.xPos - macademia.nbrviz.interest.nodeRadius,
            y: self.yPos - macademia.nbrviz.interest.nodeRadius
        });
        for(var j = 0; j <=1; j++) {
            ri.elements[j].animate({
                cx: self.xPos,
                cy: self.yPos
            }, 400, "backIn");
            ri.elements[ri.elements.length  - 1].animate({x: self.xPos, y: self.yPos}, 400, "backIn", function(){
                self.hideText(self.relatedInterestNodes)
            });
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