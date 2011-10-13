
var InterestSphere = Sphere.extend({
    init : function(params) {
        var x = params.x, y = params.y;

        this.VERTICAL_LABEL_SPACING = 0;

        // FIXME: some of these are also intialized in Sphere
        this.name = params.name;
        this.interest = params.interest;
        this.paper = params.paper;
        this.xOffset = params.xOffset;
        this.yOffset = params.yOffset;
        this.font = params.font || macademia.nbrviz.mainFont;
        this.boldFont = params.boldFont || macademia.nbrviz.mainFontBold;
        this.labelBgOpacity = params.labelBgOpacity || 0.6;
        this.inQuery = params.inQuery || false;

        this.label = this.paper.text(x + this.xOffset, y + this.yOffset, this.name)
                    .attr({fill: '#000', 'font': this.font});
        var bbox1 = this.label.getBBox();
        this.labelHeight = bbox1.height;

        var addText = this.inQuery ? '(click to remove)' : '(click to add)';
        this.addLink = this.paper.text(
                x + this.xOffset,
                y + this.yOffset + bbox1.height + this.VERTICAL_LABEL_SPACING,
                addText);
        this.addLink.attr({
            'font': this.font,
            'text-decoration' : 'underline',
            'cursor' : 'pointer'
        });

        // x and y relative to center
        this.addLinkXOffset = this.xOffset;
        this.addLinkYOffset = this.yOffset + bbox1.height + this.VERTICAL_LABEL_SPACING;
        var w = bbox1.width;
        var h = (bbox1.height*2 + this.VERTICAL_LABEL_SPACING) * 1.2;
        this.addLink.hide();

        this.labelBg = this.paper.rect(x + this.xOffset - w / 2, y + this.yOffset - h / 2, w, h);
        this.labelBg.attr({ 'fill' : '#fff',
            'fill-opacity' : this.labelBgOpacity,
            'stroke' : '#fff',
            'stroke-width' : 0.0});
        this.labelBg.hide();
        this.label.toFront();

        this._super(params);
    },

    setHighlightMode : function(mode) {
        var lastMode = this.highlightMode;
        if (mode == lastMode) {
            return;
        }
        var attrs = {};

        // change from highlight to normal and vice-versa
        if (mode == this.HIGHLIGHT_ON) {
            this.labelBg.show();
            attrs['font'] = this.boldFont;
            attrs['font-weight'] = 'bold';
            this.addLink.attr({
                x : (this.getX() + this.addLinkXOffset),
                y : (this.getY() + this.addLinkYOffset)
            });
            this.addLink.show();
            this.addLink.toFront();
        } else if (lastMode == this.HIGHLIGHT_ON) {
            this.labelBg.hide();
            attrs['font'] = this.font;
            attrs['font-weight'] = 'normal';
            this.addLink.hide();
        }

        // set font color
        if (mode == this.HIGHLIGHT_ON) {
            attrs['fill'] = '#000';
        } else if (mode == this.HIGHLIGHT_NONE) {
            attrs['fill'] = '#444';
        } else if (mode == this.HIGHLIGHT_OFF) {
            attrs['fill'] = '#666';
        }
        this.label.attr(attrs);
        this.addLink.attr(attrs);

        this._super(mode);
    },

    showText : function() {
        if (this.labelBg) { this.label.show(); }
    },

    hideText : function() {
        if (this.labelBg) { this.label.hide(); }
    },
    getRects : function() {
        return this._super().concat([this.labelBg, this.label]);
    },
    show : function() {
        var self = this;
        $.each(this.getLayers(), function(i, l) {
            if (l != self.addLink) {
                l.show();
            }
        });
    },
    getLayers : function() {
        var sphereLayers = this._super();
        var layers = [];
        $.each(this.orbit, function(i, o) { macademia.concatInPlace(layers, o.getLayers()); });
        layers.push(sphereLayers[0]);   // handle
        macademia.concatInPlace(layers, sphereLayers.slice(1));
        layers.push(this.label);
        layers.push(this.addLink);
        layers.push(this.labelBg);
        return layers;
    },
    animate : function(attrs, millis, arg1, arg2) {
        this._super(attrs, millis, arg1, arg2);
        var self = this;
        // handle rectangles (position is upper left)
        $.each([this.label, this.labelBg], function(i) {
            var a = attrs;
            if (a.x) {
                var a = $.extend({}, a);
                a.x += self.xOffset - this.attr('width') / 2;
                a.y += self.yOffset - this.attr('height') / 2;
                if (this === self.labelBg) {
                    a.y += this.attr('height') * 0.25;
                }
            }
            this.animate(a, millis, arg1, arg2);
        });
    },
    setPosition : function(x, y) {
        this._super(x, y);
        var self = this;
        // handle rectangles (position is upper left)
        $.each([this.label, this.labelBg], function() {
            var rx = x - this.attr('width') / 2;
            var ry = y - this.attr('height') / 2;
            rx += self.xOffset;
            ry += self.yOffset;
            this.attr({'x' : rx, 'y' : ry});
        });
    },
    addClicked : function(callback) {
        var self = this;
        $.each(this.getLayers(),
                function (i, l) {
                    l.click(function() { callback(self.interest, self); });
                }
        );
    },
    getBackgroundLayer : function() {
        return this.labelBg;
    }
});