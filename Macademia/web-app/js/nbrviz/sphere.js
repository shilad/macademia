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
    HIGHLIGHT_NONE : 0,
    HIGHLIGHT_ON : 1,
    HIGHLIGHT_OFF : 2,

    init : function(params) {
        this._super(params);

        this.r = params.r;
        this.scale = params.scale || 1.0;
        this.name = params.name;
        this.paper = params.paper;
        this.strokeWidth = params.strokeWidth || 2;
        this.highlightMode = this.HIGHLIGHT_NONE;
        this.glow = null;

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

        this.circle = this.paper.circle(x, y, this.scale * (this.r-this.strokeWidth))
                    .attr({fill: fill, stroke: '#777', 'stroke-width' : this.strokeWidth});

        // invisible layer (useful for event handling)
        this.handle =  this.paper.circle(x, y, this.r * this.scale)
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
        if (shouldGlow) {
            if (this.glow == null) {
                this.glow = this.circle.glow();
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
        return this.circle.attr('cx');
    },

    getY : function(){
        return this.circle.attr('cy');
    },

    getRects : function() {
        return [];
    },

    getScaledR : function() {
        return this.scale * this.r;
    },

    getCircles : function() {
        return [this.handle, this.circle];
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

    },
    onDragUp : function() {
    },

    getLayers : function() {
        return [this.handle, this.circle];
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
        $.each(this.getCircles(), function(i) {
            var a = $.extend({}, attrs);
            a.cx = a.x || a.cx || self.getX();
            a.cy = a.y || a.cy || self.getY();
            delete a.x;
            delete a.y;
            a.scale = a.scale || 1.0;
            a.r = self.r * a.scale;

            // only call the callback once
            var f = (i == 0) ? arg2 : null;
            this.animate(a, millis, arg1, f);
        });

        this.scale = attrs.scale || 1.0;
    },

    setScale : function(scale) {
        if (this.scale != scale) {
            this.animate({scale : scale}, 0);
            this.scale = scale;
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

        if (this.glow) {
            this.glow.translate(dx, dy);
        }
    },
});