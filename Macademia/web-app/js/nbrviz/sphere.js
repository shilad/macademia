

/**
 * New Raphael object - shaded sphere and text with an invisible rectangle encompassing both.
 * @param A dictionary with keys:
 *          - x x position of the center of the sphere
 *          - y y position of the center of the sphere
 *          - r radius of the sphere
 *          - hue random number representing the color
 *          - name text below the sphere
 *          - xOffset x offset of the text from the center of the sphere
 *          - yOffset y offset of the text from the center of the sphere
 */
function Sphere(params) {
    this.x = params.x;
    this.y = params.y;
    this.r = params.r;
    this.hue = params.hue || 0;
    this.xOffset = params.xOffset;
    this.yOffset = params.yOffset;
    this.name = params.name;
    this.paper = params.paper;

    // invisible layer (useful for event handling)
    this.invisible =  this.paper.rect(
            this.x - this.r,
            this.y - this.r,
            this.r * 2,
            this.r * 2 + 20)
            .attr({fill: '#000', stroke: 'none', opacity: 0});

    this.elements = [
            // gradient 1
            this.paper.ellipse(
                    this.x, this.y, this.r, this.r)
                .attr({fill: "r(.5,.9)hsb(" + this.hue + ", 1, .9)-hsb(" + this.hue + ", 1, .7)", stroke: '#ccc'}),

            // gradient 2
            this.paper.ellipse(
                    this.x, this.y, this.r - this.r / 5, this.r - this.r / 20)
                .attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0}),

            // label
            this.paper.text(this.x + this.xOffset, this.y + this.yOffset, this.name)
                .attr({fill: '#000', 'font-size': 14})
    ];
};

Sphere.prototype.getInvisible = function( ){
    return this.invisible;
};

Sphere.prototype.getX = function( ){
    return this.elements[0].cx;
};

Sphere.prototype.getY = function( ){
    return this.elements[0].cy;
};

Sphere.prototype.toFront = function() {
};

Sphere.prototype.getVisibleElements = function() {
    return this.elements;
};

Sphere.prototype.drag = function(move, start, up) {
    this.invisible.drag(move, start, up);
    $.each(this.elements, function (i, e) {e.drag(move, start, up);});
};