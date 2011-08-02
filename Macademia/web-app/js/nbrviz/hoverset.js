function HoverSet() {
    this.elements = [];
    this.mousein = null;    // support multiple subscribers
    this.mouseout = null;
    this.timeoutId = null;
};

HoverSet.prototype.add = function(e) {
    this.elements.push(e);
    var self = this;
    e.hover(
            function () { self.elementIn(); },
            function () { self.elementOut(); }
    );
};

HoverSet.prototype.addAll = function(l) {
    // implement this.
};

HoverSet.prototype.hover = function(mousein, mouseout) {
    this.mousein = mousein;
    this.mouseout = mouseout;
};

HoverSet.prototype.elementIn = function() {
    if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
    } else {
        this.mousein();
    }
};


HoverSet.prototype.elementOut = function() {
    var self = this;
    this.timeoutId = window.setTimeout(function() {
        self.mouseout();
        self.timeoutId = null;
    }, 10);

};