/**
 * This class provides support for handling hover events across a set of elements.
 * The mousein callback will be called when any of the objects in the set are
 * moused into, and the mouseout event will be called only when none of the
 * objects in the set are moused over.
 */
function HoverSet() {
    this.elements = [];
    this.mousein = [];
    this.mouseout = [];
    this.timeoutId = null;
    this.timeoutPeriod = 100;
}

HoverSet.prototype.add = function(e) {
    this.elements.push(e);
    var self = this;
    e.hover(
            function () { self.elementIn(); },
            function () { self.elementOut(); }
    );
};

HoverSet.prototype.addAll = function(l) {
    var self = this;
    $.each(l, function() {
        self.elements.push(this);
        this.hover(
            function () { self.elementIn(); },
            function () { self.elementOut(); }
        )
    });
};

HoverSet.prototype.hover = function(mousein, mouseout) {
    this.mousein.push(mousein);
    this.mouseout.push(mouseout);
};

HoverSet.prototype.elementIn = function() {
    if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
    } else {
        for (var i = 0; i < this.mousein.length; i++) {
            this.mousein[i]();
        }
    }
};


HoverSet.prototype.elementOut = function() {
    var self = this;
    this.timeoutId = window.setTimeout(function() {
        for (var i = 0; i < self.mouseout.length; i++) {
            self.mouseout[i]();
        }
        self.timeoutId = null;
    }, this.timeoutPeriod);

};