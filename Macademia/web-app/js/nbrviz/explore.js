
var ExploreViz = NbrViz.extend({
    init : function(params) {
        this.MAX_HISTORY_RADIUS = 30;
        this.MIN_HISTORY_RADIUS = 10;
        this.HISTORY_SPACING = 120;
        this.HISTORY_LENGTH = 5;

        params.peopleClickable = true;
        params.height = params.paper.height - this.MAX_HISTORY_RADIUS + 15;
        this._super(params);
        this.history = [];  // history nodes
    },
    onAddressChange : function(event) {
        var c = event.parameters.rootId.charAt(0);
        var rootClass = c == 'p' ? 'person' : 'interest';
        var rootId = event.parameters.rootId.substring(1);
        console.log('refreshing to ' + event.parameters.rootId);
        this.refreshViz(rootClass, rootId);
    },
    recenter : function(rootClass, rootId) {
        this.animateForward(rootClass, rootId);
    },
    refreshViz : function(rootClass, rootId){
        if (rootClass != 'person' && rootClass != 'interest') {
            alert('unknown klass: "' + rootClass + '" (must be person or interest).');
            return;
        }
        var name = macademia.nbrviz.getName(rootClass, rootId);
        this.setLoadingMessage('re-centering around "' + name + '"...');

        // TODO: make asynchronous
        var url = macademia.makeActionUrlWithGroup('all', 'explore', rootClass + 'Data') + '/' + rootId;

        var parentIds = [];
        var parentWeights = [];

        $.each(this.interestWeights, function (k, v) {
            parentIds.push(k);
            parentWeights.push(v);
        });
        if (parentIds.length) {
            url += '?parentIds=' + parentIds.join('_');
            url += '&parentWeights=' + parentWeights.join('_');
        }

        var self = this;
        $.ajax({
            url: url,
            dataType : 'json',
            success : function (json) { self.loadJson(new VizModel(json)); }
        });
        this.showLoadingMessage();
    },

    loadJson : function(model) {
        this.initKey(model);
        this._super(model);
    },

    initKey : function(model) {
        macademia.nbrviz.assignColors(model.getClusterIds());
        $(".addedInterestDiv").each(
                function() { if (this.id != 'queryInterestTemplate') { $(this).remove(); } }
        );
        var self = this;
        $.each(model.getClusterIds(), function(i, pid) {

            var name = self.getOrLookupInterestName(pid);
            var elem = $("#queryInterestTemplate").clone();
            elem.attr('id', 'queryInterestKey' + pid);
            var html = elem.html();
            html = html.replace(/INTEREST_ID/g, ""+pid);
            html = html.replace(/INTEREST_NAME/g, ""+name.toLowerCase());
            elem.html(html);
            $("#queryInterestTemplate").before(elem);
            elem.find('.interestSlider').slider(
                    {
                        min : 1, max : 5,
                        value : self.interestWeights[pid] || 3,
                        change : function(event, ui) {
                            self.interestWeights[pid] = ui.value;
                            $.address.update();
                        }
                    }
            );
            self.drawKeySphere(pid);
        });
        $("#currentInterests h1 span").html(model.getRootName());
    },
    interestClicked : function(interestNode) {
        this.recenter('interest', interestNode.id, interestNode.name);
    },
    personClicked : function(personNode) {
        this.recenter('person', personNode.id, personNode.name);
    },
    layoutInterests : function(json) {
        this._super(json);
        this.drawHistory();
    },

    drawHistory : function() {
//        $.each(this.history, function() { this.remove(); });
        this.history = [];
        var label = this.paper.text(50, this.paper.height-40, 'History:');
        label.attr({
            'font' : macademia.nbrviz.mainFontBold,
            'font-weight' : 'bold'
        });
        var bbox = label.getBBox();
        this.historyX = bbox.x + bbox.width + this.HISTORY_SPACING / 2;
        this.historyY = bbox.y;
        var self = this;
        for (var i = 0; i < this.HISTORY_LENGTH; i++) {
            var value = $.address.parameter('rootId' + i);
            if (!value) {
                continue;
            }
            var nodeClass = (value.charAt(0) == 'p' ) ? 'person' : 'interest';
            var nodeId = value.substring(1);
            this.history.push(this.createHistoryNode(nodeClass, nodeId, i));
        }
    },
    createHistoryNode : function(nodeClass, nodeId, step) {
        var self = this;
        var r = this.historyNodeSize(step);
        var name = macademia.nbrviz.getName(nodeClass, nodeId);
        if (name.length > 20) {
            name = name.substring(0, 18) + '...';
        }

        var attrs = {
            x : this.historyX + step * this.HISTORY_SPACING,
            y : this.historyY + (this.MAX_HISTORY_RADIUS - r),
            r : r,
            id : nodeId,
            hue: 0,
            sat : 0.2,
            brightness : 0.8,
            strokeWidth : 1,
            name: name,
            paper: this.paper,
            hoverDelay : 50,
            font : macademia.nbrviz.subFont,
            boldFont : macademia.nbrviz.subFontBold,
            xOffset : 0,
            yOffset : r + 8

        };
        var sphere;
        if (nodeClass == 'interest') {
            $.extend(attrs, {
                sat : 0.2,
                hue: macademia.nbrviz.getColor(nodeId)
            });
            sphere = new LabeledSphere(attrs);
        } else {
            $.extend(attrs, {
                imageHeight : r * 1.5,
                picture : macademia.nbrviz.getPersonPic(nodeId)
            });
            sphere = new ImageSphere(attrs);
        }
        sphere.hover(
                $.proxy(function() { this.setHighlightMode(this.HIGHLIGHT_ON); }, sphere),
                $.proxy(function() { this.setHighlightMode(this.HIGHLIGHT_NONE); }, sphere)
        );
        sphere.toFront();
        sphere.clicked($.proxy(function () { self.animateBack(this); }, step));
        return sphere;
    },
    historyNodeSize : function(stepsBack) {
        var stepSize = (this.MAX_HISTORY_RADIUS - this.MIN_HISTORY_RADIUS) / this.HISTORY_LENGTH;
        return this.MAX_HISTORY_RADIUS - stepsBack * stepSize;
    },
    animateBack : function(steps) {
        var a = Raphael.animation({ 'opacity' : 0.0, 'fill-opacity' : 0.0}, 0.5);
        $.each(this.history, function () { this.setHighlightMode(this.HIGHLIGHT_NONE); });
        for (var i = 0; i < steps; i++) {
            this.history[i].animate(
                    { 'opacity' : 0, 'fill-opacity' : 0.0}, 500
            );
        }
        for (i = steps; i < this.history.length; i++) {
            var n = this.history[i];
            var r0 = this.historyNodeSize(i);
            var r1 = this.historyNodeSize(i - steps);
            var scale = r1 / r0;
            n.animate({ x : (n.getX() - steps * this.HISTORY_SPACING),
                        y : (n.getY() - (r1 - r0)),
                        scale : scale
                    }, 500, 'linear',
                    function () { window.history.go(-1 * steps); }
                );
        }
    },
    animateForward : function(nodeClass, nodeRoot) {
        var self = this;
        for (var i = 0; i < this.history.length; i++) {
            var n = this.history[i];
            var r0 = this.historyNodeSize(i);
            var r1 = this.historyNodeSize(i+1);
            var scale = r1 / r0;
            var a = {
                    x : (n.getX() + this.HISTORY_SPACING),
                    y : (n.getY() - (r1 - r0)),
                    scale : scale
            };
            if (i + 1 >= this.HISTORY_LENGTH) {
                a['opacity'] = 0.0;
                a['fill-opacity'] = 0.0;
                // FIXME: remove hidden nodes from canvas
            }
            n.animate(a, 500, 'linear'
            );
        }
        n = this.createHistoryNode(nodeClass, nodeRoot, 0);
        n.getLayerSet().attr({'opacity' : 0, 'fill-opacity' : 0});
        n.animate(
                { 'opacity' : 1.0, 'fill-opacity' : 1.0 },
                500,
                'linear',
                function () { self.shiftToNewNode(nodeClass, nodeRoot); }
            );

    },
    shiftToNewNode : function(nodeClass, nodeRoot) {
        var params = macademia.getQueryParams();
        for (var i = this.HISTORY_LENGTH; i > 0; i--) {
            var val = params['rootId' + (i-1)];
            if (val) {
                params['rootId' + i] = val;
            }
        }
        var token = nodeClass.charAt(0) + nodeRoot;
        params['rootId0'] = token;
        params['rootId'] = token;
        macademia.setQueryParams(params);
    }
});