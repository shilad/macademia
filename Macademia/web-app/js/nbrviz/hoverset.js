/**
 * This class provides support for handling hover events across a set of elements.
 * The mousein callback will be called when any of the objects in the set are
 * moused into, and the mouseout event will be called only when none of the
 * objects in the set are moused over.
 */
function HoverSet(elems) {
    this.STATE_OUT = 0;
    this.STATE_IN_DELAY = 1;
    this.STATE_IN = 2;
    this.STATE_OUT_DELAY = 3;

    this.setCursor = true;
    this.elements = [];
    this.mousein = [];
    this.mouseout = [];
    this.timeoutId = null;
    this.inDelay = 300;
    this.triggerId = null;
    this.outDelay = 100;
    this.state = this.STATE_OUT;
    if (elems) {
        this.addAll(elems);
    }
}

HoverSet.prototype.add = function(e) {
    this.elements.push(e);
    var self = this;
    if (this.setCursor) {
        e.attr({ 'cursor' : 'pointer'});
    }
    e.hover(
            function () { self.elementIn(); },
            function () { self.elementOut(); }
    );
};

HoverSet.prototype.addAll = function(l) {
    var self = this;
    $.each(l, function() { self.add(this); });
};

HoverSet.prototype.hover = function(mousein, mouseout) {
    this.mousein.push(mousein);
    this.mouseout.push(mouseout);
};

HoverSet.prototype.elementIn = function() {
    if (this.state != this.STATE_IN && this.state != this.STATE_IN_DELAY) {
        this.state = this.STATE_IN_DELAY;
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        var self = this;
        this.triggerId = window.setTimeout(function() {
            for (var i = 0; i < self.mousein.length; i++) {
                self.mousein[i]();
            }
            self.triggerId = null;
            this.state = this.STATE_IN;
        }, this.inDelay);
    }
};


HoverSet.prototype.elementOut = function() {
    if (this.state != this.STATE_OUT && this.state != this.STATE_OUT_DELAY) {
        this.state = this.STATE_OUT_DELAY;
        if (this.triggerId) {
            window.clearTimeout(this.triggerId);
            this.triggerId = null;
        }
        var self = this;
        this.timeoutId = window.setTimeout(function() {
            for (var i = 0; i < self.mouseout.length; i++) {
                self.mouseout[i]();
            }
            self.timeoutId = null;
            this.state = this.STATE_OUT;
        }, this.outDelay);
    }
};