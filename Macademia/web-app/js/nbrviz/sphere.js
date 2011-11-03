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
        this.strokeWidth = params.strokeWidth || 2;
        this.orbitRadius = this.r / 5;
        this.highlightMode = this.HIGHLIGHT_NONE;
        this.alwaysGlow = params.alwaysGlow || false;
        this.glow = null;
        this.orbit = [];    // spheres in orbit

        var x = params.x, y = params.y;

        var fill;
        this.sat = params.sat || 1.0;
        this.hue = params.hue || 0.0;
        this.brightness = params.brightness || 0.9;

        if (this.hue == -1) {
            fill = "hsb(0,0,.9)";
        } else {
            fill = "hsb(" + this.hue + "," + 0.9*this.sat + "," + 1.1*this.brightness + ")";
        }

        this.gradient1 = this.paper.circle(x, y, this.r-this.strokeWidth)
                    .attr({fill: fill, stroke: '#777', 'stroke-width' : this.strokeWidth});

        // invisible layer (useful for event handling)
        this.handle =  this.paper.circle(x, y, this.r)
                .attr({fill: '#f00', stroke: 'none', opacity: 0.0});

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
            this.setGlow(true);
        } else if (lastMode == this.HIGHLIGHT_ON) {
            this.setGlow(false);
        }
        this.highlightMode = mode;
    },

    setGlow : function(shouldGlow) {
        if (shouldGlow || this.alwaysGlow) {
            if (this.glow == null) {
                this.glow = this.gradient1.glow();
            }
//            this.glow.toFront();
        } else {
            if (this.glow) {
                this.glow.hide();
                this.glow.remove();
                this.glow = null;
            }
        }
    },

    hide : function() {
        this.setGlow(false);
        this._super();
    },

    show : function() {
        this._super();
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
        return [];
    },

    getCircles : function() {
        return [this.handle, this.gradient1];
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
        return [this.handle, this.gradient1];
    },


    /**
     * Same parameters as raphael's animate.
     * @param attrs
     * @param millis
     * @param arg1
     * @param arg2
     */
    animate : function(attrs, millis, arg1, arg2) {
        var self = this;

        // handle ellipses (position is center)
        var x = attrs.x || attrs.cx;
        var y = attrs.y || attrs.cy;
        var newAttrs = $.extend({}, attrs);
        if (x || y) {
            delete newAttrs.x;
            delete newAttrs.y;
            newAttrs.cx = x;
            newAttrs.cy = y;

        }
        $.each(this.getCircles(), function(i) {
            this.animate(newAttrs, millis, arg1, arg2);
        });

        var d = 2 * Math.PI / this.orbit.length;
        for (var i = 0; i < this.orbit.length; i++) {
            newAttrs = $.extend({}, attrs);
            if (x || y) {
                delete newAttrs.cx;
                delete newAttrs.cy;
                newAttrs.x = x + this.r * Math.cos(i * d);
                newAttrs.y = y + this.r * Math.sin(i * d);
            }
            this.orbit[i].animate(newAttrs, millis, arg1, arg2);
        }
    },

    setPosition : function(x, y) {
        var dx = x - this.getX();
        var dy = y - this.getY();

        // handle rectangles (position is upper left)
        // HACK: only position handle, not inherited rects
        $.each([this.handle], function() {
            var rx = x - this.attr('width') / 2;
            var ry = y - this.attr('height') / 2;
            this.attr({'x' : rx, 'y' : ry});
        });

        $.each(this.getCircles(), function(i) {
            this.attr({'cx' : x, 'cy' : y});
        });

        this.positionOrbit(x, y);
        if (this.glow) {
            this.glow.translate(dx, dy);
        }
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