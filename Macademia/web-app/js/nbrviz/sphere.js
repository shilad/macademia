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
            this.r * 2 + this.yOffset / 2)
            .attr({fill: '#000', stroke: 'none', opacity: 0});

    this.elements = [

            // gradient 1
            this.paper.ellipse(
                    this.x, this.y, this.r, this.r)
                .attr({fill: "r(.5,.9)hsb(" + this.hue + ", 1, .85)-hsb(" + this.hue + ", 1, .7)", stroke: '#ccc'}),

            // gradient 2
            this.paper.ellipse(
                    this.x, this.y, this.r - this.r / 5, this.r - this.r / 20)
                .attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0}),

            // label
            this.paper.text(this.x + this.xOffset, this.y + this.yOffset, this.name)
                .attr({fill: '#000', 'font': macademia.nbrviz.mainFont})
    ];
}

Sphere.prototype.getInvisible = function( ){
    return this.invisible;
};

Sphere.prototype.getX = function( ){
    return this.elements[0].attr('cx');
};

Sphere.prototype.getY = function( ){
    return this.elements[0].attr('cy');
};

Sphere.prototype.toFront = function() {
};

Sphere.prototype.getVisibleElements = function() {
    return this.elements; // returns a copy
};

Sphere.prototype.drag = function(move, start, up) {
    this.invisible.drag(move, start, up);
    $.each(this.elements, function (i, e) {e.drag(move, start, up);});
};

Sphere.prototype.savePosition = function() {
    this.invisible.ox = this.invisible.attr('x');
    this.invisible.oy = this.invisible.attr('y');
    for (var i = 0; i <= 1; i++) {
        this.elements[i].ox = this.elements[i].attr('cx');
        this.elements[i].oy = this.elements[i].attr('cy');
    }
    this.elements[2].ox = this.elements[2].attr("x");
    this.elements[2].oy = this.elements[2].attr("y");
};

Sphere.prototype.updatePosition = function(dx, dy) {
    this.invisible.attr({x: this.invisible.ox + dx, y: this.invisible.oy + dy});
    for(var l = 0; l <= 1; l++) {
        this.elements[l].attr({cx: this.elements[l].ox + dx, cy: this.elements[l].oy + dy});
    }
    this.elements[2].attr({x: this.elements[2].ox + dx, y: this.elements[2].oy + dy});
};

Sphere.prototype.getLayers = function() {
    return [this.invisible].concat(macademia.reverseCopy(this.elements));
};