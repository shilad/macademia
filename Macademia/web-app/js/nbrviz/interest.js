
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
    this.layers.push(this.hiddenRing);
    macademia.concatInPlace(
            this.layers,
            macademia.reverseCopy(this.interest.getVisibleElements())
    );
    this.triggerSet = this.paper.set();
    this.triggerSet.push(this.interest.getVisibleElements(), this.hiddenRing);

    this.relatedInterestNodes = this.createRelatedInterestNodes();
    $.each(this.relatedInterestNodes, function(i, ri) {
                macademia.concatInPlace(self.layers, macademia.reverseCopy(ri));
            });

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
 * Finds the related interests with the two shortest names and returns a short string
 * depending on the number of related interests. Ex: "interest1, interest2, ..."
 */
InterestCluster.prototype.retrieveClusterName = function() {
    var clusterName = "";
    var shortOne = "";
    var shortTwo = "";

    if(this.relatedInterests.length == 1) {
        return this.relatedInterests[0].name;
    } else if(this.relatedInterests == 2) {
        shortOne = this.relatedInterests[0].name;
        shortTwo = this.relatedInterests[1].name;
    } else {
        for(var i in this.relatedInterests) {
            if(this.relatedInterests[i].name.length < shortOne.length || shortOne == "") {
                shortTwo = shortOne;
                shortOne = this.relatedInterests[i].name;
            } else if(this.relatedInterests[i].name.length < shortTwo.length || shortTwo == "") {
                shortTwo = this.relatedInterests[i].name;
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
        var newInterestNode = macademia.nbrviz.paper.ball(self.xPos, self.yPos, macademia.nbrviz.interest.nodeRadius, self.color, self.relatedInterests[i].name, 0, 0);
        $.each(newInterestNode, function(j) {
           newInterestNode[j].toBack();
           self.triggerSet.push(newInterestNode[j]);
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
 * @param relatedInterestNodes
 */
InterestCluster.prototype.hideText = function() {
    $.each(this.relatedInterestNodes, function(i, node) {
        node[3].hide();
    });
};

/**
 * Shows the text element of each related interest node
 * @param relatedInterestNodes
 */
InterestCluster.prototype.showText = function() {
    $.each(this.relatedInterestNodes, function(i, node) {
        node[3].show();
    });
};

InterestCluster.prototype.listeners = function() {
    this.ring = macademia.nbrviz.paper.circle(this.interest.getX(), this.interest.getY(), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + this.color + ", 1, .75)"});
    this.triggerSet.push(this.ring);

    if(this.hasCenter) {
        this.dragInterest();
    }
    var self = this;
    this.triggerSet.mouseover(function() {
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
            self.interest[3].hide();
        }
    });
    this.triggerSet.mouseout(function() {
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
            self.interest[3].show();
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
        self.interest.savePosition();
    },
    move = function (dx, dy) {
        self.interest.updatePosition(dx, dy);
    },
    up = function () {
        self.xPos = self.interest.getX();
        self.yPos = self.interest.getY();
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
//    alert("placeRelatedInterests");
    $.each(this.relatedInterestNodes, function(i){
        for(var j = 0; j < self.relatedInterestNodes[i].length - 1; j++) {
            self.relatedInterestNodes[i][j].show();
            self.relatedInterestNodes[i][j].animate({
                cx: nodePositions[i][0],
                cy: nodePositions[i][1],
                x: nodePositions[i][0] - macademia.nbrviz.interest.nodeRadius,
                y: nodePositions[i][1] - macademia.nbrviz.interest.nodeRadius
            }, 800, "elastic");
        }
        self.relatedInterestNodes[i][self.relatedInterestNodes[i].length - 1].show();
        self.relatedInterestNodes[i][self.relatedInterestNodes[i].length - 1].animate({x: textPositions[i][0], y: textPositions[i][1]}, 800, "elastic");
    });
};

InterestCluster.prototype.cancelAnimations = function() {
    this.ring.stop();
    this.hiddenRing.stop();
    var self = this;
    $.each(this.relatedInterestNodes, function(i){
        for(var j = 0; j < self.relatedInterestNodes[i].length - 1; j++) {
            self.relatedInterestNodes[i][j].stop();
        }
    });
};

InterestCluster.prototype.hideRelatedInterests = function() {
    var self = this;
    $.each(this.relatedInterestNodes, function(i){
        for(var j = 0; j < self.relatedInterestNodes[i].length - 1; j++) {
            self.relatedInterestNodes[i][j].animate({
                cx: self.xPos,
                cy: self.yPos,
                x: self.xPos - macademia.nbrviz.interest.nodeRadius,
                y: self.yPos - macademia.nbrviz.interest.nodeRadius
            }, 400, "backIn");
            self.relatedInterestNodes[i][self.relatedInterestNodes[i].length  - 1].animate({x: self.xPos, y: self.yPos}, 400, "backIn", function(){
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