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
        this.r = params.r;
        this.hue = params.hue || 0;
        this.xOffset = params.xOffset;
        this.yOffset = params.yOffset;
        this.name = params.name;
        this.paper = params.paper;
        this.font = params.font || macademia.nbrviz.mainFont;
        this.boldFont = params.boldFont || macademia.nbrviz.mainFontBold;
        this.labelBgOpacity = params.labelBgOpacity || 0.6;

        var x = params.x, y = params.y;

        var fill;
        if(this.hue == -1) {
            fill = "r(.5,.9)hsb(0, 0, .75)-hsb(0, 0, .2)";
        } else {
            fill = "r(.5,.9)hsb(" + this.hue + ", 1, .85)-hsb(" + this.hue + ", 1, .7)";
        }

        this.gradient1 = this.paper.ellipse(x, y, this.r, this.r)
                    .attr({fill: fill, stroke: '#ccc'});

                // gradient 2
        this.gradient2 = this.paper.ellipse(
                        x, y, this.r - this.r / 5, this.r - this.r / 20)
                    .attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0});

                // label
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
        this.labelBg.insertBefore(this.gradient1);
        this.labelBg.hide();

        // invisible layer (useful for event handling)
        this.handle =  this.paper.rect(
                x - this.r,
                y - this.r,
                this.r * 2,
                this.r * 2 + this.yOffset / 2)
                .attr({fill: '#000', stroke: 'none', opacity: 0});

        // the highlighting ring
        this.highlightRing = this.paper.ellipse(
                    x, y, this.r, this.r)
                    .attr({stroke: '#f00'});
        this.highlightRing.hide();

        this.installListeners();
    },

    highlight : function() {
        this.label.attr({fill: '#000', 'font': this.boldFont, 'font-weight' : 'bold'});
        this.highlightRing.show();
        this.labelBg.show();
        this.toFront();
    },

    fadeout : function() {
        this.label.attr({fill: '#666', 'font': this.font, 'font-weight' : 'normal'});
        this.highlightRing.hide();
        this.labelBg.hide();
    },

    normal : function() {
        this.label.attr({fill: '#000', 'font': this.font, 'font-weight' : 'normal'});
        this.highlightRing.hide();
        this.labelBg.hide();
    },

    show : function() {
        this._super();
        this.highlightRing.hide();
    },

    showText : function() {
        this.label.show();
    },

    hideText : function() {
        this.label.hide();
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
        return [this.handle, this.labelBg, this.label];
    },

    getCircles : function() {
        return [this.gradient1, this.gradient2, this.highlightRing];
    },

    installListeners : function() {
        this.handle.drag(
            $.proxy(this.onDragMove, this),
            $.proxy(this.onDragStart, this),
            $.proxy(this.onDragUp, this)
        );
    },

    onDragStart : function() {
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
        return [
            this.handle,
            this.highlightRing,
            this.label,
            this.gradient2,
            this.gradient1,
            this.labelBg
        ];
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
    }
});