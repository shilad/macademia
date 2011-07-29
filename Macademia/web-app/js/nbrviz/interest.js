
macademia.nbrviz.interest = macademia.nbrviz.interest || {};

macademia.nbrviz.interest.centerRadius = 30;
macademia.nbrviz.interest.clusterRadius = 150;
macademia.nbrviz.interest.nodeRadius = 10;

/**
 * Interest Cluster constructor.
 * @param params
 */
function InterestCluster(params) {
    this.xPos = params.xPos,
    this.yPos = params.yPos,
    this.relatedInterests = params.relatedInterests,
    this.color = params.color || 0.1;

    if(params.name) {
        this.name = params.name,
        this.hasCenter = true;
    } else {
        this.name = this.retrieveClusterName(this.relatedInterests),
        this.hasCenter = false;
    }

    var textOffsetX = 0,
        textOffsetY = 40;

    this.interest = macademia.nbrviz.paper.ball(this.xPos, this.yPos, macademia.nbrviz.interest.centerRadius, this.color, this.name, textOffsetX, textOffsetY);
    this.hiddenRing = this.interest[0];
    this.hiddenRing.toFront();

    var relatedInterestNodes = this.createRelatedInterestNodes();
    this.hideText(relatedInterestNodes);

    this.listeners(relatedInterestNodes);
}


/**
 * Takes an array of the names of related interests, finds the two shortest names and returns
 * a short string depending on the number of related interests. Ex: "interest1, interest2, ..."
 * @param relatedInterests an array of the names of related interests
 */
InterestCluster.prototype.retrieveClusterName = function(relatedInterests) {
    var clusterName = "";
    var shortOne = "";
    var shortTwo = "";

    if(relatedInterests.length == 1) {
        return relatedInterests[0].name;
    } else if(relatedInterests == 2) {
        shortOne = relatedInterests[0].name;
        shortTwo = relatedInterests[1].name;
    } else {
        for(var i in relatedInterests) {
            if(relatedInterests[i].name.length < shortOne.length || shortOne == "") {
                shortTwo = shortOne;
                shortOne = relatedInterests[i].name;
            } else if(relatedInterests[i].name.length < shortTwo.length || shortTwo == "") {
                shortTwo = relatedInterests[i].name;
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
        });
        relatedInterestNodes.push(newInterestNode);
    });
    return relatedInterestNodes;
};

/**
 * Hides the text element of each related interest node
 * @param relatedInterestNodes
 */
InterestCluster.prototype.hideText = function(relatedInterestNodes) {
    $.each(relatedInterestNodes, function(i) {
        relatedInterestNodes[i][3].hide();
    });
};

/**
 * Shows the text element of each related interest node
 * @param relatedInterestNodes
 */
InterestCluster.prototype.showText = function(relatedInterestNodes) {
    $.each(relatedInterestNodes, function(i) {
        relatedInterestNodes[i][3].show();
    });
};

InterestCluster.prototype.listeners = function(relatedInterestNodes) {
    this.ring = macademia.nbrviz.paper.circle(this.interest[1].attr("cx"), this.interest[1].attr("cy"), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + this.color + ", 1, .75)"});

    if(this.hasCenter) {
        this.dragInterest(relatedInterestNodes);
    }
    var self = this;
    this.hiddenRing.mouseover(function() {
        self.cancelAnimations(relatedInterestNodes);
        self.hiddenRing.animate({
            r: macademia.nbrviz.interest.clusterRadius,
            x: self.xPos - macademia.nbrviz.interest.clusterRadius,
            y: self.yPos - macademia.nbrviz.interest.clusterRadius,
            width: macademia.nbrviz.interest.clusterRadius * 2,
            height: macademia.nbrviz.interest.clusterRadius * 2
        }, 0, "linear");
        self.placeRelatedInterests(relatedInterestNodes);
        self.ring.animate({r: macademia.nbrviz.interest.clusterRadius}, 800, "elastic");
        if(!self.hasCenter) {
            self.interest[3].hide();
        }
    });
    this.hiddenRing.mouseout(function() {
        self.cancelAnimations(relatedInterestNodes);
        self.hiddenRing.animate({
            r: 0,
            x: self.xPos - macademia.nbrviz.interest.centerRadius,
            y: self.yPos - macademia.nbrviz.interest.centerRadius,
            width: macademia.nbrviz.interest.centerRadius * 2,
            height: macademia.nbrviz.interest.centerRadius * 2
        });
        self.hideRelatedInterests(relatedInterestNodes);
        self.ring.animate({r: 0}, 400, "backIn");
        if(!self.hasCenter) {
            self.interest[3].show();
        }
    });
};

InterestCluster.prototype.dragInterest = function(interestNodes) {
    var self = this;
    var start = function () {
        // storing original coordinates
        $.each(interestNodes, function(i) {
           for(var k = 0; k < interestNodes[i].length; k++) {
                interestNodes[i][k].hide();     
           }
        });
        self.ring.hide();

        for(var j = 0; j < self.interest.length; j++) {
            if(self.interest[j].attr("text")) {
                self.interest[j].ox = self.interest[j].attr("x");
                self.interest[j].oy = self.interest[j].attr("y");
            } else if(self.interest[j].attr("width")) {
                self.interest[j].ox = self.interest[j].attr("x") + macademia.nbrviz.interest.centerRadius;
                self.interest[j].oy = self.interest[j].attr("y") + macademia.nbrviz.interest.centerRadius;
            } else {
                self.interest[j].ox = self.interest[j].attr("cx");
                self.interest[j].oy = self.interest[j].attr("cy");
            }
        }
    },
    move = function (dx, dy) {
        // move will be called with dx and dy
        for(var l = 0; l < self.interest.length; l++) {
            if(self.interest[l].attr("text")) {
                self.interest[l].attr({x: self.interest[l].ox + dx, y: self.interest[l].oy + dy});
            } else if (self.interest[l].attr("width")) {
                self.interest[l].attr({x: self.interest[l].ox + dx - macademia.nbrviz.interest.centerRadius, y: self.interest[l].oy + dy - macademia.nbrviz.interest.centerRadius});
            }else {
                self.interest[l].attr({cx: self.interest[l].ox + dx, cy: self.interest[l].oy + dy});
            }
        }
    },
    up = function () {
        self.xPos = self.interest[1].attr("cx");
        self.yPos = self.interest[1].attr("cy");
        self.placeRelatedInterests(interestNodes);
        self.ring.attr({cx: self.xPos, cy: self.yPos});
        self.ring.show();
    };

    for(var i = 0; i < self.interest.length; i++) {
        this.interest[i].drag(move, start, up);
    }
};

InterestCluster.prototype.placeRelatedInterests = function(relatedInterestNodes) {
    var positions = macademia.nbrviz.calculateRelatedInterestPositions(this.relatedInterests, macademia.nbrviz.interest.clusterRadius, this.xPos, this.yPos);
    var nodePositions = positions[0];
    var textPositions = positions[1];

    $.each(relatedInterestNodes, function(i){
        for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
            relatedInterestNodes[i][j].show();
            relatedInterestNodes[i][j].animate({
                cx: nodePositions[i][0],
                cy: nodePositions[i][1],
                x: nodePositions[i][0] - macademia.nbrviz.interest.nodeRadius,
                y: nodePositions[i][1] - macademia.nbrviz.interest.nodeRadius
            }, 800, "elastic");
        }
        relatedInterestNodes[i][relatedInterestNodes[i].length - 1].show();
        relatedInterestNodes[i][relatedInterestNodes[i].length - 1].animate({x: textPositions[i][0], y: textPositions[i][1]}, 800, "elastic");
    });
};

InterestCluster.prototype.cancelAnimations = function(relatedInterestNodes) {
    this.ring.stop();
    this.hiddenRing.stop();
    $.each(relatedInterestNodes, function(i){
        for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
            relatedInterestNodes[i][j].stop();
        }
    });
};

InterestCluster.prototype.hideRelatedInterests = function(relatedInterestNodes) {
    var self = this;
    $.each(relatedInterestNodes, function(i){
        for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
            relatedInterestNodes[i][j].animate({
                cx: self.xPos,
                cy: self.yPos,
                x: self.xPos - macademia.nbrviz.interest.nodeRadius,
                y: self.yPos - macademia.nbrviz.interest.nodeRadius
            }, 400, "backIn");
            relatedInterestNodes[i][relatedInterestNodes[i].length  - 1].animate({x: self.xPos, y: self.yPos}, 400, "backIn", function(){
                self.hideText(relatedInterestNodes)
            });
        }
    });
};

InterestCluster.prototype.resetNodePositions = function(relatedInterestNodes, nodePositions, textPositions) {
    $.each(relatedInterestNodes, function(i) {
        nodePositions[i][0] = relatedInterestNodes[i][1].attr("cx");
        nodePositions[i][1] = relatedInterestNodes[i][1].attr("cy");
        textPositions[i][0] = relatedInterestNodes[i][3].attr("x");
        textPositions[i][1] = relatedInterestNodes[i][3].attr("y");
    });
};

/**
 * relatedInterest object constructor
 * @ param color of the relatedInterest
 * @ author Emi Lim
 */
function RelatedInterest(people, text, color){
    this.people = people,
    this.name = text,
    this.color = color;
}