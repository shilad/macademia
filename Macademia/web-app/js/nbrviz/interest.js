
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

    var interest = macademia.nbrviz.paper.ball(this.xPos, this.yPos, macademia.nbrviz.interest.centerRadius, this.color, this.name, textOffsetX, textOffsetY);
    interest[0].toFront();

    var positions = macademia.nbrviz.calculateRelatedInterestPositions(this.relatedInterests, macademia.nbrviz.interest.clusterRadius, this.xPos, this.yPos);
    var nodePositions = positions[0];
    var textPositions = positions[1];
    var relatedInterestNodes = this.createRelatedInterestNodes(this.relatedInterests, macademia.nbrviz.interest.clusterRadius, this.xPos, this.yPos, this.color);
    this.hideText(relatedInterestNodes);

    this.listeners(interest, relatedInterestNodes, nodePositions, textPositions, this.hasCenter, this.color, this.relatedInterests);
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
 * @param relatedInterests string array of the names of related interests
 * @param radius the radial distance that each node is placed from the center of the cluster
 * @param xPos the x position of the cluster center
 * @param yPos the y position of the cluster center
 * @param color the color of the node represented by a random number
 */
InterestCluster.prototype.createRelatedInterestNodes = function(relatedInterests, radius, xPos, yPos, color) {
    this.relatedInterests = relatedInterests,
    this.radius = radius,
    this.xPos = xPos,
    this.yPos = yPos;

    var relatedInterestNodes = [];

    $.each(relatedInterests, function(i) {
        var newInterestNode = macademia.nbrviz.paper.ball(xPos, yPos, macademia.nbrviz.interest.nodeRadius, color, relatedInterests[i].name, 0, 0);
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

InterestCluster.prototype.listeners = function(interest, relatedInterestNodes, nodePositions, textPositions, hasCenter, color, relatedInterests) {
    var ring = macademia.nbrviz.paper.circle(interest[1].attr("cx"), interest[1].attr("cy"), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + color + ", 1, .75)"});

    if(hasCenter) {
        this.dragInterest(interest, relatedInterestNodes, ring, relatedInterests);
    }
    var self = this;
    interest[0].mouseover(function() {
        interest[0].toBack();
        self.placeRelatedInterests(relatedInterestNodes);
        ring.animate({r: macademia.nbrviz.interest.clusterRadius}, 800, "elastic");
        if(!hasCenter) {
            interest[3].hide();
        }
    });
    ring.mouseout(function() {
        self.hideRelatedInterests(relatedInterestNodes, interest[1].attr("cx"), interest[1].attr("cy"));
        ring.animate({r: 0}, 400, "backIn");
        if(!hasCenter) {
            $.each(interest, function(i) {
                interest[i].show();
            });
        }
    });
};

InterestCluster.prototype.dragInterest = function(interest, interestNodes, ring, relatedInterests) {
    var self = this;
    var start = function () {
        // storing original coordinates
        $.each(interestNodes, function(i) {
           for(var k = 0; k < interestNodes[i].length; k++) {
                interestNodes[i][k].hide();     
           }
        });
        ring.hide();

        for(var j = 0; j < interest.length; j++) {
            if(interest[j].attr("text")) {
                interest[j].ox = interest[j].attr("x");
                interest[j].oy = interest[j].attr("y");
            } else if(interest[j].attr("width")) {
                interest[j].ox = interest[j].attr("x") + macademia.nbrviz.interest.centerRadius;
                interest[j].oy = interest[j].attr("y") + macademia.nbrviz.interest.centerRadius;
            } else {
                interest[j].ox = interest[j].attr("cx");
                interest[j].oy = interest[j].attr("cy");
            }
        }
    },
    move = function (dx, dy) {
        // move will be called with dx and dy
        for(var l = 0; l < interest.length; l++) {
            if(interest[l].attr("text")) {
                interest[l].attr({x: interest[l].ox + dx, y: interest[l].oy + dy});
            } else if (interest[l].attr("width")) {
                interest[l].attr({x: interest[l].ox + dx - macademia.nbrviz.interest.centerRadius, y: interest[l].oy + dy - macademia.nbrviz.interest.centerRadius});
            }else {
                interest[l].attr({cx: interest[l].ox + dx, cy: interest[l].oy + dy});
            }
        }
    },
    up = function () {
        self.xPos = interest[1].attr("cx");
        self.yPos = interest[1].attr("cy");
        console.log("x " + self.xPos + " y " + self.yPos);
        self.placeRelatedInterests(interestNodes);
        ring.attr({cx: self.xPos, cy: self.yPos});
        ring.show();
    };

    for(var i = 0; i < interest.length; i++) {
        interest[i].drag(move, start, up);
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

InterestCluster.prototype.hideRelatedInterests = function(relatedInterestNodes, xPos, yPos) {
    var self = this;
    $.each(relatedInterestNodes, function(i){
        for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
            relatedInterestNodes[i][j].animate({
                cx: xPos,
                cy: yPos,
                x: xPos - macademia.nbrviz.interest.nodeRadius,
                y: yPos - macademia.nbrviz.interest.nodeRadius
            }, 400, "backIn");
            relatedInterestNodes[i][relatedInterestNodes[i].length  - 1].animate({x: xPos, y: yPos}, 400, "backIn", function(){
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