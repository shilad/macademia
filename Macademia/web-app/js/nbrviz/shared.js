var macademia = macademia || {};
macademia.nbrviz = macademia.nbrviz || {};

macademia.nbrviz.initPaper = function(domId, width, height) {
    macademia.nbrviz.paper = new Raphael(domId, width, height);

    macademia.nbrviz.paper.customAttributes.personArc = function(xPos, yPos, strokeWidth, percentage, innerCircle){
        var alpha = 360 / 60 * (percentage * 60),
           radius = innerCircle+strokeWidth/2,
                a = (90 - alpha) * Math.PI / 180,
                x = xPos + radius * Math.cos(a),
                y = yPos - radius * Math.sin(a),
                path;
        if (percentage != 1){
            path = [["M", xPos, yPos-radius], ["A", radius, radius, 0, +(alpha > 180), 1, x, y]];
        }else {
            path = [["M", xPos, yPos-radius], ["A", radius, radius, 0, 1, 1, xPos - 1 + 0.9, yPos-radius]];
        }
        // what the path variables mean:
        // ["M", x, y] - starting point of drawing path of the vector
        return {path: path, "stroke-width": strokeWidth};
    };

    return macademia.nbrviz.paper;
};


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

    $.each(relatedInterests, function(i, related) {
        var angle = angleSlice*i;

        var nodePositionX = xPos + radius * Math.cos(startAngle + angleSlice / 2 + angle),
            nodePositionY = yPos - radius * Math.sin(startAngle + angleSlice / 2 + angle);

        nodePositions.push([nodePositionX, nodePositionY]);

        var textPositionX = Math.cos(startAngle + angleSlice / 2 + angle) * (4 * related.name.length + textOffset),
            textPositionY = Math.sin(startAngle + angleSlice / 2 + angle) * textOffset;

        textPositions.push([nodePositionX + textPositionX, nodePositionY - textPositionY]);
    });
    return [nodePositions, textPositions];
}

macademia.nbrviz.makeHsb = function(h) {
    // treat it as brightness
    if (h < 0) {
        return 'hsb(0,0,' + -h + ')';
    } else {
        return 'hsb(' + h + ',1,.6)';
    }
};