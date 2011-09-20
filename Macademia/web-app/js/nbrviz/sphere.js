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
var Sphere = RaphaelComponent.extend({
    init : function(params) {
        this._super(params);
        this.HIGHLIGHT_NONE = 0;
        this.HIGHLIGHT_ON = 1;
        this.HIGHLIGHT_OFF = 2;

        this.r = params.r;
        this.xOffset = params.xOffset;
        this.yOffset = params.yOffset;
        this.name = params.name;
        this.paper = params.paper;
        this.font = params.font || macademia.nbrviz.mainFont;
        this.boldFont = params.boldFont || macademia.nbrviz.mainFontBold;
        this.orbitRadius = this.r / 5;
        this.labelBgOpacity = params.labelBgOpacity || 0.6;
        this.highlightMode = this.HIGHLIGHT_NONE;
        this.glow = null;
        this.orbit = [];    // spheres in orbit

        var x = params.x, y = params.y;

        var fill;
        this.sat = params.sat || 1.0;
        this.hue = params.hue || 0.0;
        this.brightness = params.brightness || 0.9;

        if (this.hue == -1) {
            fill = "r(.5,.9)hsb(0, 0, .9)-hsb(0, 0, .80)";
        } else {
            fill = ("r(.5,.9)" +
                    "hsb(" + this.hue + "," + this.sat + "," + this.brightness + ")-" +
                    "hsb(" + this.hue + ", " + this.sat + "," + (0.89 * this.brightness) + ")");
        }

        // label
        if (this.name) {
            this.label = this.paper.text(x + this.xOffset, y + this.yOffset, this.name)
                        .attr({fill: '#000', 'font': this.font});

            var bbox = this.label.getBBox();
            this.labelBg = this.paper.rect(
                                x + this.xOffset - 1.2*bbox.width / 2,
                                y + this.yOffset - 1.2*bbox.height/2,
                                bbox.width*1.2,
                                bbox.height*1.2
                            );
            this.labelBg.attr({ 'fill' : '#fff', 'fill-opacity' : this.labelBgOpacity, 'stroke-width' : 0});
            this.labelBg.hide();
            this.label.toFront();
        } else {
            this.label = null;
            this.labelBg = null;
        }

        this.gradient1 = this.paper.ellipse(x, y, this.r, this.r)
                    .attr({fill: fill, stroke: '#ccc'});
        this.gradient2 = this.paper.ellipse(
                        x, y, this.r - this.r / 5, this.r - this.r / 20)
                    .attr({stroke: "none", fill: "r(.5,.1)#ddd-#ddd", opacity: 0});

        // invisible layer (useful for event handling)
        this.handle =  this.paper.rect(
                x - this.r,
                y - this.r,
                this.r * 2,
                this.r * 2 + this.yOffset / 2)
                .attr({fill: '#000', stroke: 'none', opacity: 0});

        this.installListeners();
    },

    highlightNone : function() { this.setHighlightMode(this.HIGHLIGHT_NONE); },
    highlightOn : function() { this.setHighlightMode(this.HIGHLIGHT_ON); },
    highlightOff : function() { this.setHighlightMode(this.HIGHLIGHT_OFF); },
    setHighlightMode : function(mode) {
        var lastMode = this.highlightMode;
        if (mode == lastMode) {
            return;
        }
        var attrs = {};

        // change from highlight to normal and vice-versa
        if (mode == this.HIGHLIGHT_ON) {
            if (this.labelBg) { this.labelBg.show(); }
            attrs['font'] = this.boldFont;
            attrs['font-weight'] = 'bold';
            if (this.glow == null) {
                this.glow = this.gradient1.glow();
            }
        } else if (lastMode == this.HIGHLIGHT_ON) {
            if (this.labelBg) { this.labelBg.hide(); }
            attrs['font'] = this.font;
            attrs['font-weight'] = 'normal';
            if (this.glow != null) {
                this.glow.hide();
                this.glow.remove();
                this.glow = null;
            }
        }

        // set color
        if (mode == this.HIGHLIGHT_ON) {
            attrs['fill'] = '#000';
        } else if (mode == this.HIGHLIGHT_NONE) {
            attrs['fill'] = '#666';
        } else if (mode == this.HIGHLIGHT_OFF) {
            attrs['fill'] = '#999';
        }
        if (this.labelBg) { this.label.attr(attrs); }
        this.highlightMode = mode;
    },

    hide : function() {
        if (this.glow) {
            this.glow.hide();
            this.glow.remove();
            this.glow = null;
        }
        this._super();
    },

    show : function() {
        this._super();
    },

    showText : function() {
        if (this.labelBg) { this.label.show(); }
    },

    hideText : function() {
        if (this.labelBg) { this.label.hide(); }
    },

    getHandle : function( ){
        return this.handle;
    },

    getX : function( ){
        return this.gradient1.attr('cx');
    },

    getY : function(){
        return this.gradient1.attr('cy');
    },

    getRects : function() {
        if (this.label) {
            return [this.handle, this.labelBg, this.label];
        } else {
            return [this.handle];
        }
    },

    getCircles : function() {
        return [this.gradient1, this.gradient2];
    },

    installListeners : function() {
        this.handle.drag(
            $.proxy(this.onDragMove, this),
            $.proxy(this.onDragStart, this),
            $.proxy(this.onDragUp, this)
        );
    },

    onDragStart : function() {
        this.ox = this.x;
        this.oy = this.y;
        $.each(this.getRects(),
                function () {
                    this.ox = this.attr('x');
                    this.oy = this.attr('y');
                });
        $.each(this.getCircles(),
                function () {
                    this.ox = this.attr('cx');
                    this.oy = this.attr('cy');
                });
    },
    onDragMove : function(dx, dy) {
        $.each(this.getRects(), function () {
                    this.attr({x : this.ox + dx, y : this.oy + dy});
                });
        $.each(this.getCircles(),function () {
                    this.attr({cx : this.ox + dx, cy : this.oy + dy});
                });
        this.positionOrbit(this.ox + dx, this.oy + dy);

    },
    onDragUp : function() {
    },

    getLayers : function() {
        var layers = [];
        $.each(this.orbit, function(i, o) { macademia.concatInPlace(layers, o.getLayers()); });
        layers.push(this.handle);
        if (this.label) { layers.push(this.label); }
        layers.push(this.gradient2);
        layers.push(this.gradient1);
        if (this.labelBg) { layers.push(this.labelBg); }
        return layers;
    },


    /**
     * Same parameters as raphael's animate.
     * @param attrs
     * @param millis
     * @param arg1
     * @param arg2
     */
    animate : function(attrs, millis, arg1, arg2) {
        // handle rectangles (position is upper left)
        var self = this;
        $.each(this.getRects(), function(i) {
            var a = attrs;
            if (a.x) {
                var a = $.extend({}, a);
                a.x = a.x - this.attr('width') / 2;
                a.y = a.y - this.attr('height') / 2;
                // label offset
                if (this != self.handle) {
                    a.x += self.xOffset;
                    a.y += self.yOffset;
                }
            }
            this.animate(a, millis, arg1, arg2);
        });

        // handle ellipses (position is center)
        var newAttrs = $.extend({}, attrs);
        if (attrs.x) {
            delete newAttrs.x;
            delete newAttrs.y;
            newAttrs.cx = attrs.x;
            newAttrs.cy = attrs.y;

        }
        $.each(this.getCircles(), function(i) {
            this.animate(newAttrs, millis, arg1, arg2);
        });

        var d = 2 * Math.PI / this.orbit.length;
        for (var i = 0; i < this.orbit.length; i++) {
            newAttrs = $.extend({}, attrs);
            if (attrs.x) {
                newAttrs.x = attrs.x + this.r * Math.cos(i * d);
                newAttrs.y = attrs.y + this.r * Math.sin(i * d);
            }
            this.orbit[i].animate(newAttrs, millis, arg1, arg2);
        }
    },

    setPosition : function(x, y) {
        // handle rectangles (position is upper left)
        var self = this;
        $.each(this.getRects(), function() {
            var rx = x - this.attr('width') / 2;
            var ry = y - this.attr('height') / 2;
            if (this != self.handle) {
                rx.x += self.xOffset;
                rx.y += self.yOffset;
            }
            this.attr({'x' : rx, 'y' : ry});
        });

        $.each(this.getCircles(), function(i) {
            this.attr({'cx' : x, 'cy' : y});
        });

        this.positionOrbit(x, y);
    },

    addOrbit : function(numPlanets) {
        for (var i = 0; i < numPlanets; i++) {
            this.orbit.push(new Sphere({
                r : this.orbitRadius,
                paper : this.paper,
                x : 0,
                y : 0,
                hue : this.hue,
                brightness : this.brightness * 0.3,
                sat : this.sat
            }));
        }
        this.positionOrbit(this.getX(), this.getY());
    },

    positionOrbit : function(x, y) {
        var d = 2 * Math.PI / this.orbit.length;
        for (var i = 0; i < this.orbit.length; i++) {
            var x2 = x + this.r * Math.cos(i * d);
            var y2 = y + this.r * Math.sin(i * d);
            this.orbit[i].setPosition(x2, y2);
        }
    }
});