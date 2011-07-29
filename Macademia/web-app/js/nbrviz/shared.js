var macademia = macademia || {};
macademia.nbrviz = macademia.nbrviz || {};

macademia.nbrviz.initPaper = function(name, width, height) {
    macademia.nbrviz.paper = new Raphael(name, width, height);
}


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

/**
 * Calculates the positions of the related interest nodes.
 * @param relatedInterests an array of related interests
 * @param radius the distance each node is from the center
 * @param xPos x position of the original center
 * @param yPos y position of the original center
 * @param startAngle angle in radians that nodes begin to be placed at
 * @param endAngle angle in radians that nodes end being placed
 */
macademia.nbrviz.calculateRelatedInterestPositions  = function(relatedInterests, radius, xPos, yPos, startAngle, endAngle){
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