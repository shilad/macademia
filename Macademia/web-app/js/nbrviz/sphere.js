

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
function Sphere(params) {
    this.x = params.x;
    this.y = params.y;
    this.r = params.r;
    this.hue = params.hue || 0;
    this.xOffset = params.xOffset;
    this.yOffset = params.yOffset;
    this.name = params.name;

    this.elements = [
            // invisible layer
            this.rect(this.x - this.r,
                    this.y - this.r,
                    this.r * 2,
                    this.r * 2 + 20)
                .attr({fill: '#000', stroke: 'none', opacity: 0}),

            // gradient 1
            this.ellipse(
                    this.x, this.y, this.r, this.r)
                .attr({fill: "r(.5,.9)hsb(" + this.hue + ", 1, .9)-hsb(" + this.hue + ", 1, .7)", stroke: '#ccc'}),

            // gradient 2
            this.ellipse(
                    this.x, this.y, this.r - this.r / 5, this.r - this.r / 20)
                .attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0}),

            // label
            this.text(this.x + this.xOffset, this.y + this.yOffset, this.name)
                .attr({fill: '#000', 'font-size': 14})
    ]
};

Sphere.prototype.getInvisible = function( ){
    return this.elements[0];
};

Sphere.prototype.toFront = function() {
};

Sphere.prototype.getElements = function() {
    return this.elements;
};