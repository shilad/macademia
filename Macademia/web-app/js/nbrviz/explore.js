
var ExploreViz = NbrViz.extend({
    MAX_HISTORY_RADIUS : 30,
    MIN_HISTORY_RADIUS : 8,
    HISTORY_SPACING : 120,
    HISTORY_LENGTH : 5,

    init : function(params) {
        params.peopleClickable = true;
        params.vizHeight = params.height - 2 * this.MAX_HISTORY_RADIUS;
        this._super(params);
        this.history = [];  // history nodes
        this.keyPapers = [];
    },
    onAddressChange : function(event) {
        var c = event.parameters.rootId.charAt(0);
        var rootClass = c == 'p' ? 'person' : 'interest';
        var rootId = event.parameters.rootId.substring(1);
        this.refreshViz(rootClass, rootId);
    },
    getRootNode : function() {
        if (this.rootClass == 'person') {
            return this.people[this.rootId];
        } else {
            return this.interestClusters[this.rootId];
        }
    },
    recenter : function(rootClass, rootId, name, node) {
        this.animateForward(rootClass, rootId, node);
    },
    refreshViz : function(rootClass, rootId){
        if (this.stateIsSet(this.STATE_LOADING)) {
            alert('invalid state in refreshViz: ' + this.state);
            return;
        }
        if (rootClass != 'person' && rootClass != 'interest') {
            alert('unknown klass: "' + rootClass + '" (must be person or interest).');
            return;
        }
        var name = macademia.nbrviz.getName(rootClass, rootId);
        this.setLoadingMessage('re-centering around "' + name + '"...');

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
        this.showLoadingMessage();
        $.ajax({
            url: url,
            dataType : 'json',
            success : function (json) { self.loadJson(new VizModel(json)); }
        });

        this.setState(this.STATE_LOADING);
    },

    loadJson : function(model) {
        this.initKey(model);
        this._super(model);
    },

    initKey : function(model) {
        $.each(this.keyPapers, function() { this.clear(); });
        this.keyPapers = [];
        macademia.nbrviz.colors.assign(model.getClusterIds());
        $(".addedInterestDiv").each(
                function() { if (this.id != 'queryInterestTemplate') { $(this).remove(); } }
        );
        var self = this;
        $.each(model.getClusterIds(), function(i, pid) {
            if (model.getRootClass() == 'interest' && pid == model.getRootId()) {
                return;
            }
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
            var sphereElem =  $(".interestKey[interest='" + pid + "']");
            self.keyPapers.push(self.drawKeySphere(sphereElem, pid));
        });
        if (model.getRootClass() == 'interest') {
            $(".rootInterestKey").show();
            this.keyPapers.push(
                    self.drawKeySphere($(".rootInterestKey"), model.getRootId())
                );
        } else {
            $(".rootInterestKey").hide();
        }
        $(".rootInterestName").html(model.getRootName());
    },
    interestClicked : function(interestNode) {
        if (!this.enabled) { return; }
        this.recenter('interest', interestNode.id, interestNode.name, interestNode);
    },
    personClicked : function(personNode) {
        if (!this.enabled) { return; }
        this.recenter('person', personNode.id, personNode.name, personNode);
    },
    layoutInterests : function(json) {
        this._super(json);
        this.drawHistory();
    },

    drawHistory : function() {
        if (!this.historyLabel) {
            this.historyLabel = this.paper.text(50, this.paper.height-40, 'History:');
            this.historyLabel.attr({
                'font' : macademia.nbrviz.mainFontBold,
                'font-weight' : 'bold'
            });
            var bbox = this.historyLabel.getBBox();
            this.historyX = bbox.x + bbox.width + this.HISTORY_SPACING / 2;
            this.historyY = bbox.y;
        }
        for (var i = 0; i < this.HISTORY_LENGTH; i++) {
            var value = $.address.parameter('rootId' + i);
            if (!value) {
                if (this.history.length > i && this.history[i]) {
                    this.history[i].remove();
                }
                continue;
            }
            var nodeClass = (value.charAt(0) == 'p' ) ? 'person' : 'interest';
            var nodeId = value.substring(1);

            if (this.history.length > i && this.history[i].id == nodeId) {
                continue;
            }
            if (this.history.length > i) {
                this.history[i].remove();
            }
            var node = this.createHistoryNode(nodeClass, nodeId, i);
            while (this.history.length <= i) {
                this.history.push(null);
            }
            this.history[i] = node;
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
            brightness : 1.0,
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
                sat : 0.3,
                hue: macademia.nbrviz.colors.getColor(nodeId)
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
        var delta = (this.MAX_HISTORY_RADIUS - this.MIN_HISTORY_RADIUS);
        return this.MIN_HISTORY_RADIUS + delta * Math.pow(0.62, stepsBack);
    },
    animateBack : function(steps) {
        this.setEnabled(false);
        this.resetAllHovers();

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
    animateForward : function(nodeClass, nodeRoot, node) {
        var millis = 1000;
        this.setEnabled(false);
        this.resetAllHovers();

        this.setState(this.STATE_ANIMATING);
        this.shiftToNewNode(nodeClass, nodeRoot);

        var isSubInterest = false;
        if (node.type == 'interest' && !(node.id in this.interestClusters)) {
            var iids = this.getInterestClusterIds();
            iids.unshift(node.id);
            macademia.nbrviz.colors.assign(iids);
            node = new LabeledSphere(node.cloneParams());
            this.fakeNode = node;
            isSubInterest = true;
        }

        // raise the screen and animate the new and old roots
        this.historyLabel.toFront();
        this.raiseScreen(this.historyLabel, 0.8);
        $.each(this.history, function () {this.toFront()});
        this.getRootNode().toFront();
        var p1 = this.getSpokePosition( 5 * Math.PI / 4);

        var s1 = 1.0 / (this.getRootNode().type == 'interest'
                            ? NbrViz.ROOT_INTEREST_SCALE
                            : NbrViz.ROOT_PERSON_SCALE);

        this.getRootNode().animate({ x : p1.screenX(), y : p1.screenY(), scale : s1}, millis);

        var p2 = this.getCenterPosition();
        node.toFront();
        var s2 = node.type == 'interest' ? NbrViz.ROOT_INTEREST_SCALE : NbrViz.ROOT_PERSON_SCALE;
        var params = { x : p2.screenX(), y : p2.screenY(), scale : s2};

        if (isSubInterest) { // subinterest
            params.scale *= MNode.COLLAPSED_RADIUS / MNode.RELATED_RADIUS;
            var hue = macademia.nbrviz.colors.getColor(node.id);
            params.fill = 'hsb(' + hue + ',' + node.sat + ',' + node.brightness + ')';
        }
        node.animate(params, millis);

        // update the history
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
            var f = null;
            if (i + 1 >= this.HISTORY_LENGTH) {
                a['opacity'] = 0.0;
                a['fill-opacity'] = 0.0;
                f = $.proxy(function () { this.remove(); }, n);
            }
            n.animate(a, millis, 'linear', f);
        }
        n = this.createHistoryNode(nodeClass, nodeRoot, 0);
        var fill = n.circle.attr('fill');
        n.getLayerSet().attr({ 'opacity' : 0.0, 'fill-opacity' : 0.0});
        n.animate(
                { 'opacity' : 1.0, 'fill-opacity' : 1.0 , fill : fill},
                millis,
                'linear',
                function () {
                    self.unsetState(self.STATE_ANIMATING);
                    self.checkIfComplete();
                }
            );
        this.history.splice(0, 0, n);

        // trim down the history
        if (this.history.length > this.HISTORY_LENGTH) {
            this.history = this.history.slice(0, this.HISTORY_LENGTH);
        }

    },
    checkIfComplete : function() {
        if (this._super() && this.fakeNode) {
            this.fakeNode.fadeAndRemove();
            this.fakeNode = null;
        }
    },
    shiftToNewNode : function(nodeClass, nodeRoot) {
        var params = macademia.getQueryParams();
        for (var i = this.HISTORY_LENGTH; i > 0; i--) {
            var val = params['rootId' + (i-1)];
            if (val) { params['rootId' + i] = val; }
        }
        var token = nodeClass.charAt(0) + nodeRoot;
        params['rootId0'] = token;
        params['rootId'] = token;
        macademia.setQueryParams(params);
    }
});