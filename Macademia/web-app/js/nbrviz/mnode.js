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

    /**
     * Constructor initialization
     * @param params
     */
    init : function(params) {

        this._super(params);

        // Constants
        this.HOVER_CENTER = -1;
        this.HOVER_NONE = -2;

        this.COLLAPSED_RADIUS = 30;
        this.EXPANDED_RADIUS = 100;
        this.RELATED_RADIUS = 15;

        this.POS_NOTIFY_THRESHOLD = 20;

        this.STATE_COLLAPSED = 0;
        this.STATE_EXPANDING = 1;
        this.STATE_EXPANDED = 2;
        this.STATE_COLLAPSING = 3;
        this.STATE_DRAGGING = 4;

        this.id = params.id;
        this.name = params.name;
        this.state = this.STATE_COLLAPSED;

        this.centerNode = null;
        this.collapsedRadius = params.collapsedRadius || this.COLLAPSED_RADIUS;
        this.expandedRadius = params.expandedRadius || this.EXPANDED_RADIUS;
        this.relatedNodeRadius = params.relatedNodeRadius || this.RELATED_RADIUS;
        this.expandedHandleRadius = params.expandedHandleRadius || (this.expandedRadius + 2 * this.relatedNodeRadius);

        this.relatedInterests = this.relatedInterests || params.relatedInterests || [];
        this.relatedInterestNodes = [];

        this.color = params.color || 0.1;

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
                function(i, ri) {macademia.concatInPlace(layers, ri.getLayers()); }
            );
        layers.push(this.ring);
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
     * Creates a single related interest
     * @param interest
     * @param pos [x, y] for center of circle.
     * @param textPos [x, y] for center of label.
     */
    createOneRelatedInterestNode : function(interest, pos, textPos) {
        var sat = Math.max(Math.min(1.0, interest.relevance * interest.relevance * 2), .2);
//        console.log('relatedness for ' + interest.name + ' is ' + sat);
        var node = new InterestSphere({
            x: this.x,
            y: this.y,
            r: this.relatedNodeRadius,
            hue: interest.color,
            name: interest.name,
            sat : sat,
            interest : interest,
            xOffset: textPos[0] - pos[0],
            yOffset: textPos[1] - pos[1],
            paper: this.paper,
            hoverDelay : 50,
            font : macademia.nbrviz.subFont,
            boldFont : macademia.nbrviz.subFontBold
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
        this.onHoverIn(0);
    },

    addClicked : function(callback) {
        var self = this;
        this.getLayerSet().click(
            function() {
                if (self.lastInterestHoverIndex != self.HOVER_NONE) {
                    callback(
                            self.relatedInterests[self.lastInterestHoverIndex],
                            self.relatedInterestNodes[self.lastInterestHoverIndex]
                    );
                }
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
    onHoverIn : function(millis) {
        if (this.state != this.STATE_COLLAPSED && this.state != this.STATE_COLLAPSING) {
            return;
        }
        this.createRelatedInterestNodes();
        var millis = millis || 800;
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
            }, millis, "linear");
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
            ri.animate(
                    { x: nodePositions[i][0], y: nodePositions[i][1] },
                    millis,
                    "elastic");
        });
        self.lastInterestHoverIndex = self.HOVER_NONE;
        this.ring.animate(
                {r: this.expandedRadius, cx : this.newX, cy: this.newY}, millis, "elastic",
                function () { self.state = self.STATE_EXPANDED; }
        );
    },
    onHoverOut : function() {
        if (this.state != this.STATE_EXPANDED && this.state != this.STATE_EXPANDING) {
            return;
        }
        this.state = this.STATE_COLLAPSING;
        this.stop();
        var r = this.collapsedRadius;
        this.getHandle().animate({ r: r, cx: this.origX, cy: this.origY }, 0, "linear");
        var self = this;
        $.each(this.relatedInterestNodes,
            function(i, ri) {
                ri.hideText();
                ri.animate(
                        { x: self.origX, y: self.origY },
                        400,
                        "backIn",
                        function () { ri.hide(); }
                );
            }
        );
        this.ring.animate(
                {r: 0}, 400, "backIn",
                function () {
                    self.state = self.STATE_COLLAPSED;
                    this.x = this.origX;
                    this.y = this.origY;
                }
        );
        var li = this.lastInterestHoverIndex;
        if (li != this.HOVER_NONE) {
            this.lastInterestHoverIndex = this.HOVER_NONE;
            this.onInterestHoverOut(this.relatedInterests[li], this.relatedInterestNodes[li]);
        }
    },

    /**
     * Related interest hover handlers
     * @param relatedInterest
     * @param relatedInterestNode
     */
    onInterestHoverIn : function(relatedInterest, relatedInterestNode) {
        if (this.state != this.STATE_EXPANDED) {
            return;
        }
        var self = this;
        $.each(this.relatedInterestNodes,
                function (i, n) {
                    if (n == relatedInterestNode) {
                        n.toFront(self.centerNode.getBottomLayer());
                        n.highlightOn();
                    } else {
                        n.highlightOff();
                    }
                });
        for (var i = 0; i < this.hoverInterestListeners.length; i++) {
            this.hoverInterestListeners[i]['in'](this, relatedInterest, relatedInterestNode);
        }
    },
    onInterestHoverOut : function(relatedInterest, relatedInterestNode) {
        $.each(this.relatedInterestNodes, function (i, n) { n.highlightNone(); });
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

    /**
     * Mouse move handler
     */
    onMouseMove : function(e) {
        if (this.state != this.STATE_EXPANDED) {
            return;
        }
        var ms = Date.now();
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
            var last = this.lastInterestHoverIndex;
            this.lastInterestHoverIndex = closestIndex;
            if (last >= 0) {
                this.onInterestHoverOut(
                        this.relatedInterests[last],
                        this.relatedInterestNodes[last]);
            }
            this.onInterestHoverIn(
                    this.relatedInterests[closestIndex],
                    this.relatedInterestNodes[closestIndex]);
        }
    }
});





