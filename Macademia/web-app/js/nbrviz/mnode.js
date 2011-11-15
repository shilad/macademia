/**
 * Inheritance pattern described at http://ejohn.org/blog/simple-javascript-inheritance/
 *
 * A single main node (either an interest cluster or a person).
 *
 * Center node must have:
 * - getHandle
 * - normal
 * - getX
 * - getY
 * - getLayers
 *
 * @param params
 */
var MNode = RaphaelComponent.extend(
{          
    HOVER_CENTER : -1,
    HOVER_NONE : -2,

    COLLAPSED_RADIUS : 30,
    EXPANDED_RADIUS : 100,
    RELATED_RADIUS : 15,

    POS_NOTIFY_THRESHOLD : 20,

    STATE_COLLAPSED : 0,
    STATE_EXPANDING : 1,
    STATE_EXPANDED : 2,
    STATE_COLLAPSING : 3,
    STATE_DRAGGING : 4,

    /**
     * Constructor initialization
     * @param params
     */
    init : function(params) {

        this._super(params);

        // Constants

        this.enabled = true;

        this.id = params.id;
        this.name = params.name;
        this.state = this.STATE_COLLAPSED;
        this.centerNode = null;

        this.scale = params.scale || 1.0;
        this.collapsedRadius = params.collapsedRadius || this.COLLAPSED_RADIUS;
        this.expandedRadius = params.expandedRadius || this.EXPANDED_RADIUS;
        this.relatedNodeRadius = params.relatedNodeRadius || this.RELATED_RADIUS;
        this.expandedHandleRadius = params.expandedHandleRadius || (this.expandedRadius + 2 * this.relatedNodeRadius);
        this.centerActive = (params.centerActive !== false);

        this.clickText = params.clickText;
        this.relatedInterests = this.relatedInterests || params.relatedInterests || [];
        this.relatedInterestNodes = [];

        this.color = params.color || null;

        this.moveListeners = [];
        this.hoverInterestListeners = [];
        this.hoverSet = new HoverSet();

        // For drag notification
        this.lastNotifyX = null;
        this.lastNotifyY = null;

        this.x = params.x || 0;
        this.y = params.y || 0;

        // -2 means no hover, -1 means center interest hover
        this.lastInterestHoverIndex = this.HOVER_NONE;

        this.createCenterNode();
        if (this.centerNode == null) { alert('no center node created!'); }
        this.createRing();
        this.getHandle().toFront();

        this.installListeners();
    },

    setEnabled : function(enabled) {
        this.enabled = enabled;
    },

    /**
     * Sets the initial position of the node, and creates related interests.
     * @param x
     * @param y
     */
    setPosition : function(x, y) {
        this.x = x;
        this.y = y;
        this.lastNotifyX = x;
        this.lastNotifyY = y;
        // Initial positioning, or update?
        this.centerNode.setPosition(x, y);
        this.ring.attr({cx : x, cy : y});
    },

    getLayers : function() {
        var layers = [];
        macademia.concatInPlace(layers, this.centerNode.getLayers());
        $.each(this.relatedInterestNodes,
                function(i, ri) {
                    var ril = ri.getLayers();
                    macademia.concatInPlace(layers, ril.slice(0, ril.length));
                }
            );
        layers.push(this.ring);
        $.each(this.relatedInterestNodes,
                function(i, ri) {
                    layers.push(ri.getBackgroundLayer());
                }
            );
        return layers;
    },

    /**
     * Subclasses must override the following.
     * Generates the center node.
     */
    createCenterNode : function() {
        alert('child class must override createCenterNode!');
    },

    /**
     * Returns the hidden ring suitable for mouse handling.
     */
    getHandle : function() {
        return this.centerNode.getHandle();
    },
    createRing : function() {
        this.ring = this.paper.circle(this.x, this.y, 0)
                .toBack()
                .attr({opacity: 0.2, "stroke-width": 1, stroke: "#555", fill: "hsb(" + this.color + ", 1, .75)"});
    },

    /**
     * Creates all related interests.
     */
    createRelatedInterestNodes : function() {
        if (this.relatedInterests.length == this.relatedInterestNodes.length) {
            return;
        }
        this.relatedInterestNodes = [];
        var positions = macademia.nbrviz.calculateRelatedInterestPositions(
                            this.relatedInterests,
                            this.expandedRadius,
                            this.x, this.y
                        );

        var self = this;
        $.each(this.relatedInterests, function(i) {
            var pos = positions[0][i];
            var textPos = positions[1][i];
            var node = self.createOneRelatedInterestNode(this, pos, textPos);
            node.hide();
            self.relatedInterestNodes.push(node);
        });
    },

    /**
     * Replaces related interest nodes.
     */
    setRelatedInterests : function(interests) {
        if (this.relatedInterestNodes) {
            for (var i = 0; i < this.relatedInterestNodes.length; i++) {
                this.hoverSet.remove(this.relatedInterestNodes[i]);
                this.relatedInterestNodes[i].remove();
            }
        }
        this.relatedInterestNodes = [];
        this.relatedInterests = interests;
    },

    /**
     * Creates a single related interest
     * @param interest
     * @param pos [x, y] for center of circle.
     * @param textPos [x, y] for center of label.
     */
    createOneRelatedInterestNode : function(interest, pos, textPos) {
        var sat = Math.max(Math.min(1.0, interest.relevance * interest.relevance * 2), .2);
//        console.log('relatedness for ' + interest.name + ' is ' + sat);
        var node = new LabeledSphere({
            x: this.x,
            y: this.y,
            r: this.relatedNodeRadius,
            hue: this.color || interest.color,
            name: interest.name,
            sat : sat,
            interest : interest,
            xOffset: textPos[0] - pos[0],
            yOffset: textPos[1] - pos[1],
            paper: this.paper,
            hoverDelay : 50,
            font : macademia.nbrviz.subFont,
            boldFont : macademia.nbrviz.subFontBold,
            clickText : this.clickText
        });
        node.hideText();
        node.toBack();
        var self = this;
        node.hover(
                function () { self.onInterestHoverIn(interest, node); },
                function () { self.onInterestHoverOut(interest, node); }
        );
        this.hoverSet.addAll(node.getLayers());
        return node;
    },
    hoverInterest : function(mouseIn, mouseOut) {
        this.hoverInterestListeners.push({ 'in' : mouseIn, 'out' : mouseOut});
    },
    /**
     * Add an event handler that is called after the interest is moved.
     * The handler will be called with three arguments: interestCluster, x, y
     * @param onMove
     */
    move : function(onMove) {
        this.moveListeners.push(onMove);
    },
    /**
     * Sets up all event handlers.
     */
    installListeners : function() {
        var self = this;

        // Overall hover events
        this.hoverSet.addAll(this.getLayers());
        this.hoverSet.hover(
                $.proxy(this.onHoverIn, this),
                $.proxy(this.onHoverOut, this)
            );

        this.getHandle().mousemove(function (e) {
            // fixup the event to have reasonable x and y
            if ($.browser.safari || $.browser.webkit) {
                // do nothing
            } else if ($.browser.msie) {
                e.x = event.clientX + document.body.scrollLeft;
                e.y = event.clientY + document.body.scrollTop;
            } else {  // grab the x-y pos.s if browser is NS
                e.x= e.pageX;
                e.y = e.pageY;
            }
            self.onMouseMove(e);
        });

        // Main drag events
        this.getHandle().drag(
                $.proxy(this.onDragMove, this),
                $.proxy(this.onDragStart, this),
                $.proxy(this.onDragUp, this)
            );
    },

    expand : function() {
        this.onHoverIn(0, true);
    },

    collapse : function() {
        this.onHoverOut(0, true);
    },

    clicked : function(callback) {
        var self = this;
        this.getLayerSet().click(
            function() {
                var node = self.getLastHoverNode();
                if (node != null) { callback(node); }
            }
        );
    },
    animate : function(attrs, millis, arg1, arg2) {
        if (this.state != this.STATE_COLLAPSED) {
            alert('state is ' + this.state + ' in animate');
            return;
        }
        this.centerNode.animate(attrs, millis, arg1, arg2);
    },

    /**
     * Overall hover handlers
     */
    onHoverIn : function(millis, override) {
        if (!this.enabled && !override) {
            return;
        }
        if (this.state != this.STATE_COLLAPSED && this.state != this.STATE_COLLAPSING) {
            return;
        }
        this.createRelatedInterestNodes();
        millis = millis || 400;
        this.state = this.STATE_EXPANDING;
        this.stop();
        var r = this.expandedHandleRadius;
        this.origX = this.x;
        this.origY = this.y;

        this.newX = macademia.pinch(this.x, r*1.1, this.paper.width - r*1.1);
        this.newY = macademia.pinch(this.y, r*1.1, this.paper.height - r*1.1);

        this.centerNode.animate({
                x: this.newX,
                y: this.newY
            }, 200, "linear");
        this.getHandle().stop();
        this.getHandle().animate({
                r: r,
                cx: this.newX,
                cy: this.newY
            }, 0, "linear");

        var positions = macademia.nbrviz.calculateRelatedInterestPositions(
                            this.relatedInterests, this.expandedRadius, this.newX, this.newY);
        var nodePositions = positions[0];

        var self = this;
        $.each(this.relatedInterestNodes, function(i, ri) {
            ri.setPosition(self.x, self.y);
            ri.show();
            ri.showText();
            ri.highlightNone();
//            ri.getBackgroundLayer().insertAfter(self.ring);
            ri.animate(
                    { x: nodePositions[i][0], y: nodePositions[i][1] },
                    millis,
                    "elastic");
        });
        $.each(this.relatedInterestNodes.concat(this.centerNode),
                function() { this.highlightOff(); });

        self.lastInterestHoverIndex = self.HOVER_NONE;
        this.ring.animate(
                {r: this.expandedRadius, cx : this.newX, cy: this.newY}, millis, "elastic",
                function () {
                    self.state = self.STATE_EXPANDED;
                    if (self.centerActive) {
                        self.onNodeHoverIn(self.centerNode);
                    }
                }
        );

    },
    onHoverOut : function(ms, override) {
        if (!this.enabled && !override) {
            return;
        }
        if (this.state != this.STATE_EXPANDED && this.state != this.STATE_EXPANDING) {
            return;
        }
        ms = ms || 400;

        this.state = this.STATE_COLLAPSING;

        // reset highlighting
        var latest = this.getLastHoverNode();
        if (latest) { this.onNodeHoverOut(latest); }
        this.centerNode.highlightNone();

        this.stop();
        var r = this.collapsedRadius * this.scale;
        this.getHandle().animate({ r: r, cx: this.origX, cy: this.origY }, 0, "linear");
        this.centerNode.animate({
                x: this.origX,
                y: this.origY,
                scale : this.scale
            }, ms / 2, "linear");
        var self = this;
        $.each(this.relatedInterestNodes,
            function(i, ri) {
                ri.hideText();
                ri.animate(
                        { x: self.origX, y: self.origY },
                        ms,
                        "backIn",
                        function () { ri.hide(); }
                );
            }
        );
        this.ring.animate(
                {r: 0}, ms, "backIn",
                function () {
                    self.state = self.STATE_COLLAPSED;
                    this.x = this.origX;
                    this.y = this.origY;
                }
        );
    },

    onNodeHoverIn : function(node) {
        if (this.state != this.STATE_EXPANDED) {
            return;
        }
        if (node == this.centerNode) {
            this.lastInterestHoverIndex = this.HOVER_CENTER;
            node.highlightOn();
            if (this.rootClass == 'interest') {
                this.onInterestHoverIn(node.interest, node);
            }
        } else {
            node.toFront(this.centerNode.getBottomLayer());
            node.getBackgroundLayer().insertBefore(this.ring);

            // must be a related interest node
            node.highlightOn();
            this.lastInterestHoverIndex = this.relatedInterestNodes.indexOf(node);
            this.onInterestHoverIn(node.interest, node);
        }
    },

    onNodeHoverOut : function(node) {
        this.lastInterestHoverIndex = this.HOVER_NONE;
        node.highlightOff();
        var li = this.lastInterestHoverIndex;
        if (node != this.centerNode || this.rootClass == 'interest') {
            this.onInterestHoverOut(node.interest, node);
        }
    },

    /**
     * Related interest hover handlers
     * @param relatedInterest
     * @param relatedInterestNode
     */
    onInterestHoverIn : function(relatedInterest, relatedInterestNode) {
        for (var i = 0; i < this.hoverInterestListeners.length; i++) {
            this.hoverInterestListeners[i]['in'](this, relatedInterest, relatedInterestNode);
        }
    },
    onInterestHoverOut : function(relatedInterest, relatedInterestNode) {
        for (var i = 0; i < this.hoverInterestListeners.length; i++) {
            this.hoverInterestListeners[i]['out'](this, relatedInterest, relatedInterestNode);
        }
    },

    /**
     * Drag handlers
     */
    onDragStart : function() {
        this.state = this.STATE_DRAGGING;
        this.ring.hide();
        this.centerNode.highlightNone();
        $.each(this.relatedInterestNodes, function(i, ri) {
            ri.onDragStart();
            ri.hide();
            ri.highlightNone();
        });
    },
    onDragMove : function(dx, dy) {
        this.x = this.centerNode.getX();
        this.y = this.centerNode.getY();
        this.centerNode.highlightNone();
        $.each(this.relatedInterestNodes, function(i, ri) {
            ri.onDragMove(dx, dy);
            ri.highlightNone();
        });
        this.notifyMoveListeners();
    },
    onDragUp : function() {
        this.x = this.centerNode.getX();
        this.y = this.centerNode.getY();
        $.each(this.relatedInterestNodes, function(i, ri) {
            ri.onDragUp();
            ri.show();
        });
        this.ring.attr('cx', this.x);
        this.ring.attr('cy', this.y);
        this.ring.show();
        this.state = this.STATE_EXPANDED;
        this.notifyMoveListeners();
    },
    notifyMoveListeners : function() {
        var d = Math.abs(this.lastNotifyX - this.x) + Math.abs(this.lastNotifyY - this.y);
        if (d >= this.POS_NOTIFY_THRESHOLD) {
            this.lastNotifyX = this.x;
            this.lastNotifyY = this.y;
            for (var i = 0; i < this.moveListeners.length; i++) {
                this.moveListeners[i](this, this.x, this.y);
            }
        }
    },
    getX : function() {
        return this.centerNode.getX();
    },
    getY : function() {
        return this.centerNode.getY();
    },

    setScale : function(scale) {
        this.centerNode.setScale(scale);
        this.scale = scale;
    },

    getLastHoverNode : function() {
        if (this.lastInterestHoverIndex == this.HOVER_NONE) {
            return null;
        } else if (this.lastInterestHoverIndex == this.HOVER_CENTER) {
            return this.centerNode;
        } else {
            return this.relatedInterestNodes[this.lastInterestHoverIndex];
        }
    },

    /**
     * Mouse move handler
     */
    onMouseMove : function(e) {
        if (this.state != this.STATE_EXPANDED) {
            return;
        }
        var last = this.getLastHoverNode();

        // check center node
        if (this.centerActive) {
            var d = macademia.nbrviz.distance(this.getX(), this.getY(), e.x, e.y);
            if (d <= this.centerNode.r * 1.5) {
                if (last != this.centerNode) {
                    if (last !=  null) { this.onNodeHoverOut(last); }
                    this.onNodeHoverIn(this.centerNode);
                }
                return;
            }
        }

        var closestIndex = this.HOVER_NONE;
        var closestDistance = 1000000000000000;
        $.each(this.relatedInterestNodes,
            function(i, node) {
                var d =  macademia.nbrviz.distance(node.getX(), node.getY(), e.x, e.y);
                if (closestIndex < 0 || d < closestDistance) {
                    closestIndex = i;
                    closestDistance = d;
                }
            });

        if (closestIndex != this.lastInterestHoverIndex) {
            if (last != null) { this.onNodeHoverOut(last); }
            this.onNodeHoverIn(this.relatedInterestNodes[closestIndex]);
        }
    }
});





