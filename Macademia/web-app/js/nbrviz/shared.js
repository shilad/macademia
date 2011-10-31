var macademia = macademia || {};
macademia.nbrviz = macademia.nbrviz || {};

macademia.nbrviz.mainFont = '14px Palatino Linotype, Book Antiqua, Palatino, Arial';
macademia.nbrviz.mainFontBold = '14px Palatino Linotype Bold, Book Antiqua Bold, Palatino Bold, Arial Bold';
macademia.nbrviz.subFont = '14px Times New Roman, Arial';
macademia.nbrviz.subFontBold = '14px Times New Roman Bold, Arial Bold';

macademia.nbrviz.distance = function(x1, y1, x2, y2) {
        var dx = x1 - x2, dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);
    };

macademia.nbrviz.initPaper = function(domId, width, height) {
    macademia.nbrviz.paper = new Raphael(domId, width, height);

    macademia.nbrviz.paper.customAttributes.personArc = function(xPos, yPos, strokeWidth, percentage, rotation, innerCircle) {
        var angle = Math.PI * 2 * percentage,
            radius = innerCircle+strokeWidth/2,
            x0 = xPos + radius * Math.cos(rotation),
            y0 = yPos + radius * Math.sin(rotation),
            x1 = xPos + radius * Math.cos(rotation + angle),
            y1 = yPos + radius * Math.sin(rotation + angle),
            path;
        var largeArc = (angle > Math.PI) ? 1 : 0;
        if (percentage == 1) {
            // tricky to draw a closed arc...
            path = [["M", xPos + radius, yPos],
                ["A", radius, radius, 0, 1, 1, xPos - radius, yPos],
                ["A", radius, radius, 0, 1, 1, xPos + radius, yPos]
            ];
        } else {
            path = [["M", x0, y0], ["A", radius, radius, 0, largeArc, 1, x1, y1]];
        }

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
            this.ellipse(x, y, r, r).attr({fill: "r(.5,.9)hsb(" + hue + ", 1, .9)-hsb(" + hue + ", 1, .7)", stroke: '#ccc'}),
            this.ellipse(x, y, r - r / 5, r - r / 20).attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0}),
            this.text(x + xOffset, y + yOffset, name).attr({fill: '#000', 'font-size': 14})
    ];
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
        textOffset = 30,
        nodePositions=[],
        textPositions=[];

    $.each(relatedInterests, function(i, related) {
        var angle = angleSlice*i;

        var nodePositionX = xPos + radius * Math.cos(startAngle + angleSlice / 2 + angle),
            nodePositionY = yPos - radius * Math.sin(startAngle + angleSlice / 2 + angle);

        nodePositions.push([nodePositionX, nodePositionY]);

        var textPositionX = Math.cos(startAngle + angleSlice / 2 + angle) * (3 * related.name.length + textOffset-6),
            textPositionY = Math.sin(startAngle + angleSlice / 2 + angle) * textOffset;

        textPositions.push([nodePositionX + textPositionX, nodePositionY - textPositionY]);
    });
    return [nodePositions, textPositions];
};

macademia.nbrviz.makeHsb = function(h) {
    // treat it as brightness
    if (h < 0) {
        return 'hsb(0,0,' + -h + ')';
    } else {
        return 'hsb(' + h + ',.5,1)';
    }
};

/**
 * In place version of array concatenation
 * @param dest Array to be updated.
 * @param extra To be added to dest.
 */
macademia.concatInPlace = function(dest, extra) {
    for (var i = 0; i < extra.length; i++) {
        dest.push(extra[i]);
    }
    return dest;
};


macademia.reverseCopy = function(l) {
    return l.slice(0).reverse();
};

macademia.getInterestName = function(id) {
    return $.ajax({
          url: macademia.makeActionUrlWithGroup('all', 'interest', 'name') + "?id="+id,
          async: false
     }).responseText;
};

macademia.startTimer = function() {
    macademia.beginTime = Date.now();
};

macademia.endTimer = function(label) {
    var elapsed = Date.now() - macademia.beginTime;
    console.log(label + ' required ' + elapsed + ' milliseconds');
    macademia.beginTime = Date.now();
};

macademia.pinch = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
};


function screenArea() {
    return $(document).width() * $(document).height();
};