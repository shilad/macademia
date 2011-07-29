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
    this.color = params.color;

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

    this.listeners(interest, relatedInterestNodes, nodePositions, textPositions, this.hasCenter, this.color);
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
}

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
}

/**
 * Hides the text element of each related interest node
 * @param relatedInterestNodes
 */
InterestCluster.prototype.hideText = function(relatedInterestNodes) {
    $.each(relatedInterestNodes, function(i) {
        relatedInterestNodes[i][3].hide();
    });
}

/**
 * Shows the text element of each related interest node
 * @param relatedInterestNodes
 */
InterestCluster.prototype.showText = function(relatedInterestNodes) {
    $.each(relatedInterestNodes, function(i) {
        relatedInterestNodes[i][3].show();
    });
}

InterestCluster.prototype.listeners = function(interest, relatedInterestNodes, nodePositions, textPositions, hasCenter, color) {
    var ring = macademia.nbrviz.paper.circle(interest[1].attr("cx"), interest[1].attr("cy"), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + color + ", 1, .75)"});

    if(hasCenter) {
        this.dragInterest(interest, relatedInterestNodes, ring, nodePositions, textPositions);
    }
    var self = this;
    interest[0].mouseover(function() {
        interest[0].toBack();
        self.placeRelatedInterests(relatedInterestNodes, nodePositions, textPositions);
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
}

InterestCluster.prototype.dragInterest = function(interest, interestNodes, ring, nodePositions, textPositions) {
    var self = this;
    var start = function () {
        // storing original coordinates
        var i = 0;
        var currentInterest = interest;
        while(true) {
            for(var j = 0; j < currentInterest.length; j++) {
                if(currentInterest[j].attr("text")) {
                    currentInterest[j].ox = currentInterest[j].attr("x");
                    currentInterest[j].oy = currentInterest[j].attr("y");
                } else if(currentInterest[j].attr("width")) {
                    currentInterest[j].ox = currentInterest[j].attr("x") + macademia.nbrviz.interest.centerRadius;
                    currentInterest[j].oy = currentInterest[j].attr("y") + macademia.nbrviz.interest.centerRadius;
                } else {
                    currentInterest[j].ox = currentInterest[j].attr("cx");
                    currentInterest[j].oy = currentInterest[j].attr("cy");
                }
            }
            if(i == interestNodes.length) {
                break;
            }
            currentInterest = interestNodes[i];
            i++
        }
        ring.ox = ring.attr("cx");
        ring.oy = ring.attr("cy");
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
        for(var i = 0; i < interestNodes.length; i++) {
            var relatedInterest = interestNodes[i];
            for(l = 0; l < relatedInterest.length; l++) {
                if(relatedInterest[l].attr("text")) {
                    relatedInterest[l].attr({x: relatedInterest[l].ox + dx, y: relatedInterest[l].oy + dy});
                } else if (relatedInterest[l].attr("width")) {
                    relatedInterest[l].attr({x: relatedInterest[l].ox + dx - macademia.nbrviz.interest.centerRadius, y: relatedInterest[l].oy + dy - macademia.nbrviz.interest.centerRadius});
                }else {
                    relatedInterest[l].attr({cx: relatedInterest[l].ox + dx, cy: relatedInterest[l].oy + dy});
                }
            }
        }
        ring.attr({cx: ring.ox + dx, cy: ring.oy + dy});
        self.resetNodePositions(interestNodes, nodePositions, textPositions);
    },
    up = function () {
        self.showText(interestNodes);
    };

    for(var i = 0; i < interest.length; i++) {
        interest[i].drag(move, start, up);
    }
}

InterestCluster.prototype.placeRelatedInterests = function(relatedInterestNodes, nodePositions, textPositions) {
    $.each(relatedInterestNodes, function(i){
        for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
            relatedInterestNodes[i][j].animate({
                cx: nodePositions[i][0],
                cy: nodePositions[i][1],
                x: nodePositions[i][0] - macademia.nbrviz.interest.nodeRadius,
                y: nodePositions[i][1] - macademia.nbrviz.interest.nodeRadius
            }, 800, "elastic");
            relatedInterestNodes[i][relatedInterestNodes[i].length - 1].show();
            relatedInterestNodes[i][relatedInterestNodes[i].length - 1].animate({x: textPositions[i][0], y: textPositions[i][1]}, 800, "elastic");
        }
    });
}

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
}

InterestCluster.prototype.resetNodePositions = function(relatedInterestNodes, nodePositions, textPositions) {
    $.each(relatedInterestNodes, function(i) {
        nodePositions[i][0] = relatedInterestNodes[i][1].attr("cx");
        nodePositions[i][1] = relatedInterestNodes[i][1].attr("cy");
        textPositions[i][0] = relatedInterestNodes[i][3].attr("x");
        textPositions[i][1] = relatedInterestNodes[i][3].attr("y");
    });
}
