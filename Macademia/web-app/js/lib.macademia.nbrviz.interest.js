/**
 * Created by IntelliJ IDEA.
 * User: Melissa Marshall
 * Date: 7/27/11
 * Time: 11:13 AM
 */
window.onload = function() {

    /**
     * New Raphael object - shaded sphere and text with an invisible rectangle encompassing both.
     * @param x x position of the center of the sphere
     * @param y y position of the center of the sphere
     * @param r radius of the sphere
     * @param hue random number representing the color
     * @param name text below the sphere
     * @param xOffset x offset of the text from the center of the sphere
     * @param yOffset y offset of the text from the center of the sphere
     */
    Raphael.fn.ball = function (x, y, r, hue, name, xOffset, yOffset) {
        hue = hue || 0;
        return [
                this.rect(x - r, y - r, r * 2, r * 2 + 20).attr({fill: '#000', stroke: 'none', opacity: 0}),
                this.ellipse(x, y, r, r).attr({fill: "r(.5,.9)hsb(" + hue + ", 1, .75)-hsb(" + hue + ", 1, .4)", stroke: '#ccc'}),
                this.ellipse(x, y, r - r / 5, r - r / 20).attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0}),
                this.text(x + xOffset, y + yOffset, name).attr({fill: '#000', 'font-size': 14})
        ]
    };

    var paper = new Raphael("holder", 1173, 800);
    var centerRadius = 30,
    clusterRadius = 150,
    nodeRadius = 10;

    var interestCluster1 = new InterestCluster({
        xPos: 300,
        yPos: 300,
        relatedInterests: [
            {name:"German"},
            {name:'natural language processing'},
            {name:'Japanese linguistics'},
            {name:'Hungarian language'},
            {name:'linguistics'},
            {name:'latin'},
            {name:'pragmatics'},
            {name:'German language'},
            {name:'wine chemistry'},
            {name:'figurative language'},
            {name:'Romance languages'},
            {name:'historical languages'},
            {name:'Nahuatl'}
        ],
        color: 0.4
    });

    var interestCluster2 = new InterestCluster({
        xPos: 600,
        yPos: 300,
        relatedInterests: [
            {name:"German"},
            {name:'natural language processing'},
            {name:'Japanese linguistics'},
            {name:'Hungarian language'},
            {name:'linguistics'},
            {name:'latin'},
            {name:'pragmatics'},
            {name:'German language'},
            {name:'wine chemistry'},
            {name:'figurative language'},
            {name:'Romance languages'},
            {name:'historical languages'},
            {name:'Nahuatl'}
        ],
        color: 0.8,
        name: 'tagging'
    });

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
            this.name = retrieveClusterName(this.relatedInterests),
            this.hasCenter = false;
        }

        var textOffsetX = 0,
            textOffsetY = 40;

        var interest = paper.ball(this.xPos, this.yPos, centerRadius, this.color, this.name, textOffsetX, textOffsetY);
        interest[0].toFront();

        var positions = calculateRelatedInterestPositions(this.relatedInterests, clusterRadius, this.xPos, this.yPos);
        var nodePositions = positions[0];
        var textPositions = positions[1];
        var relatedInterestNodes = createRelatedInterestNodes(this.relatedInterests, clusterRadius, this.xPos, this.yPos, this.color);
        hideText(relatedInterestNodes);

        listeners(interest, relatedInterestNodes, nodePositions, textPositions, this.hasCenter, this.color);
    }


    /**
     * Takes an array of the names of related interests, finds the two shortest names and returns
     * a short string depending on the number of related interests. Ex: "interest1, interest2, ..."
     * @param relatedInterests an array of the names of related interests
     */
    function retrieveClusterName(relatedInterests) {
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
     * Calculates the positions of the related interest nodes.
     * @param relatedInterests an array of related interests
     * @param radius the distance each node is from the center
     * @param xPos x position of the original center
     * @param yPos y position of the original center
     * @param startAngle angle in radians that nodes begin to be placed at
     * @param endAngle angle in radians that nodes end being placed
     */
    function calculateRelatedInterestPositions(relatedInterests, radius, xPos, yPos, startAngle, endAngle){
        startAngle = startAngle || 0;
        endAngle = endAngle || 2 * Math.PI;

        var angleSlice = (endAngle - startAngle)/relatedInterests.length,
            textOffset = 18,
            nodePositions=[],
            textPositions=[];

        for (var i=0; i < relatedInterests.length; i++){
            var angle = angleSlice*i;

            var nodePositionX = xPos + radius * Math.cos(startAngle + angleSlice / 2 + angle),
                nodePositionY = yPos - radius * Math.sin(startAngle + angleSlice / 2 + angle);

            nodePositions.push([nodePositionX, nodePositionY]);


            var textPositionX = Math.cos(startAngle + angleSlice / 2 + angle) * (4 * relatedInterests[i].name.length + textOffset),
                textPositionY = Math.sin(startAngle + angleSlice / 2 + angle) * textOffset;

            textPositions.push([nodePositionX + textPositionX, nodePositionY - textPositionY]);
        }
        return [nodePositions, textPositions];
    }

    /**
     * Creates an array of interest nodes from the list of related interests.
     * @param relatedInterests string array of the names of related interests
     * @param radius the radial distance that each node is placed from the center of the cluster
     * @param xPos the x position of the cluster center
     * @param yPos the y position of the cluster center
     * @param color the color of the node represented by a random number
     */
    function createRelatedInterestNodes(relatedInterests, radius, xPos, yPos, color) {
        this.relatedInterests = relatedInterests,
        this.radius = radius,
        this.xPos = xPos,
        this.yPos = yPos;

        var relatedInterestNodes = [];

        $.each(relatedInterests, function(i) {
            var newInterestNode = paper.ball(xPos, yPos, nodeRadius, color, relatedInterests[i].name, 0, 0);
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
    function hideText(relatedInterestNodes) {
        $.each(relatedInterestNodes, function(i) {
            relatedInterestNodes[i][3].hide(); 
        });
    }

    /**
     * Shows the text element of each related interest node
     * @param relatedInterestNodes
     */
    function showText(relatedInterestNodes) {
        $.each(relatedInterestNodes, function(i) {
            relatedInterestNodes[i][3].show();
        });
    }

    function listeners(interest, relatedInterestNodes, nodePositions, textPositions, hasCenter, color) {
        var ring = paper.circle(interest[1].attr("cx"), interest[1].attr("cy"), 0).toBack().attr({opacity: .1, "stroke-width": 1, stroke: "black", fill: "hsb(" + color + ", 1, .75)"});

        if(hasCenter) {
            dragInterest(interest, relatedInterestNodes, ring, nodePositions, textPositions);
        }
        interest[0].mouseover(function() {
            interest[0].toBack();
            placeRelatedInterests(relatedInterestNodes, nodePositions, textPositions);
            ring.animate({r: clusterRadius}, 800, "elastic");
            if(!hasCenter) {
                interest[3].hide();
            }
        });
        ring.mouseout(function() {
            hideRelatedInterests(relatedInterestNodes, interest[1].attr("cx"), interest[1].attr("cy"));
            ring.animate({r: 0}, 400, "backIn");
            if(!hasCenter) {
                $.each(interest, function(i) {
                    interest[i].show();
                });
            }
        });
    }

    function dragInterest(interest, interestNodes, ring, nodePositions, textPositions) {
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
                        currentInterest[j].ox = currentInterest[j].attr("x") + centerRadius;
                        currentInterest[j].oy = currentInterest[j].attr("y") + centerRadius;
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
                    interest[l].attr({x: interest[l].ox + dx - centerRadius, y: interest[l].oy + dy - centerRadius});
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
                        relatedInterest[l].attr({x: relatedInterest[l].ox + dx - centerRadius, y: relatedInterest[l].oy + dy - centerRadius});
                    }else {
                        relatedInterest[l].attr({cx: relatedInterest[l].ox + dx, cy: relatedInterest[l].oy + dy});
                    }
                }
            }
            ring.attr({cx: ring.ox + dx, cy: ring.oy + dy});
            resetNodePositions(interestNodes, nodePositions, textPositions);
        },
        up = function () {
            showText(interestNodes);
        };

        for(var i = 0; i < interest.length; i++) {
            interest[i].drag(move, start, up);
        }
    }

    function placeRelatedInterests(relatedInterestNodes, nodePositions, textPositions) {
        $.each(relatedInterestNodes, function(i){
            for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
                relatedInterestNodes[i][j].animate({
                    cx: nodePositions[i][0],
                    cy: nodePositions[i][1],
                    x: nodePositions[i][0] - nodeRadius,
                    y: nodePositions[i][1] - nodeRadius
                }, 800, "elastic");
                relatedInterestNodes[i][relatedInterestNodes[i].length - 1].show();
                relatedInterestNodes[i][relatedInterestNodes[i].length - 1].animate({x: textPositions[i][0], y: textPositions[i][1]}, 800, "elastic");
            }
        });
    }

    function hideRelatedInterests(relatedInterestNodes, xPos, yPos) {
        $.each(relatedInterestNodes, function(i){
            for(var j = 0; j < relatedInterestNodes[i].length - 1; j++) {
                relatedInterestNodes[i][j].animate({
                    cx: xPos,
                    cy: yPos,
                    x: xPos - nodeRadius,
                    y: yPos - nodeRadius
                }, 400, "backIn");
                relatedInterestNodes[i][relatedInterestNodes[i].length  - 1].animate({x: xPos, y: yPos}, 400, "backIn", function(){
                    hideText(relatedInterestNodes)
                });
            }
        });
    }

    function resetNodePositions(relatedInterestNodes, nodePositions, textPositions) {
        $.each(relatedInterestNodes, function(i) {
            nodePositions[i][0] = relatedInterestNodes[i][1].attr("cx");
            nodePositions[i][1] = relatedInterestNodes[i][1].attr("cy");
            textPositions[i][0] = relatedInterestNodes[i][3].attr("x");
            textPositions[i][1] = relatedInterestNodes[i][3].attr("y");
        });
    }
};
