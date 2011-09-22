var RaphaelComponent = Class.extend({
    init : function(params) {
        if (!params.paper) {
            throw('params.paper is null');
        }
        this.hoverSet = null;
        this.paper = params.paper;
        this.hoverDelay = params.hoverDelay || null;
    },
    hover : function(mouseoverCallback, mouseoutCallback) {
        this.getHoverSet().hover(mouseoverCallback, mouseoutCallback);
    },
    getLayers : function() { alert('children must override getLayers()'); },
    getHoverSet : function() {
        if (this.hoverSet == null) {
            this.hoverSet = new HoverSet(this.getLayers());
            if (this.hoverDelay != null) {
                this.hoverSet.inDelay = this.hoverDelay;
            }
        }
        return this.hoverSet;
    },
    getLayerSet : function() {
        return this.paper.set(this.getLayers());
    },
    stop : function() {
        this.getLayerSet().stop();
    },
    getBottomLayer : function() {
        var layers = this.getLayers();
        return layers[layers.length - 1];
    },
    toFront : function(behind) {
        var layers = this.getLayers();
        if (behind) {
            layers[0].insertBefore(behind);
        } else {
            layers[0].toFront();
        }
        for (var i = 1; i < layers.length; i++) {
            layers[i].insertBefore(layers[i-1]);
        }
    },
    toBack : function(inFrontOf) {
        var revLayers = macademia.reverseCopy(this.getLayers());
        if (inFrontOf) {
            revLayers[0].insertAfter(inFrontOf);
        } else {
            revLayers[0].toBack();
        }
        for (var i = 1; i < revLayers.length; i++) {
            revLayers[i].insertAfter(revLayers[i-1]);
        }
    },
    show : function() {
        this.getLayerSet().show();
    },
    hide : function() {
        this.getLayerSet().hide();
    },
    drag : function(move, start, up) {
        this.getLayerSet().drag(move, start, up);
    }
});
