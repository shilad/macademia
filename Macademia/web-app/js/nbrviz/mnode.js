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
        this.EXPANDED_RADIUS = 120;
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

        this.relatedInterests = params.relatedInterests || [];
        this.relatedInterestNodes = [];

        this.color = params.color || 0.1;

        this.moveListeners = [];
        this.hoverInterestListeners = [];
        this.hoverSet = new HoverSet();

        // For drag notification
        this.lastNotifyX = null;
        this.lastNotifyY = null;

        // -2 means no hover, -1 means center interest hover
        this.lastInterestHoverIndex = this.HOVER_NONE;
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
        if (this.centerNode == null) {
            this.createCenterNode();
            if (this.centerNode == null) { alert('no center node created!'); }
            this.createRelatedInterestNodes();
            this.createRing();
            this.getHandle().toFront();
            this.installListeners();
        } else {
            this.centerNode.setPosition(x, y);
            this.ring.attr({cx : x, cy : y});
            $.each(this.relatedInterestNodes, function() {this.setPosition(x, y);});
        }
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
        console.log('relatedness for ' + interest.name + ' is ' + sat);
        var node = new Sphere({
            x: this.x,
            y: this.y,
            r: this.relatedNodeRadius,
            hue: interest.color,
            name: interest.name,
            sat : sat,
            xOffset: textPos[0] - pos[0],
            yOffset: textPos[1] - pos[1],
            paper: this.paper,
            hoverDelay : 50,
            font : macademia.nbrviz.subFont,
            boldFont : macademia.nbrviz.subFontBold
        });
        node.hideText();
        node.toBack();
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

        this.getHandle().mousemove($.proxy(this.onMouseMove, this));

        // Interest hover events
        $.each(this.relatedInterestNodes, function(i, n) {
            var ri = self.relatedInterests[i];
            n.hover(
                    function () { self.onInterestHoverIn(ri, n); },
                    function () { self.onInterestHoverOut(ri, n); }
            );
        });

        // Main drag events
        this.getHandle().drag(
                $.proxy(this.onDragMove, this),
                $.proxy(this.onDragStart, this),
                $.proxy(this.onDragUp, this)
            );
    },

    /**
     * Overall hover handlers
     */
    onHoverIn : function() {
        if (this.state != this.STATE_COLLAPSED && this.state != this.STATE_COLLAPSING) {
            return;
        }
        this.state = this.STATE_EXPANDING;
        this.stop();
        var r = this.expandedRadius + this.relatedNodeRadius * 2;
        this.getHandle().animate({
                r: r,
                x: this.x - r,
                y: this.y - r,
                width: r * 2,
                height: r * 2
            }, 0, "linear");

        var positions = macademia.nbrviz.calculateRelatedInterestPositions(
                            this.relatedInterests, this.expandedRadius, this.x, this.y);
        var nodePositions = positions[0];
        var textPositions = positions[1];

        var self = this;
        $.each(this.relatedInterestNodes, function(i, ri) {
            ri.show();
            ri.showText();
            ri.highlightNone();
            ri.animate(
                    { x: nodePositions[i][0], y: nodePositions[i][1] },
                    800,
                    "elastic");
        })
        self.lastInterestHoverIndex = self.HOVER_NONE;
        this.ring.animate(
                {r: this.expandedRadius}, 800, "elastic",
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
        this.getHandle().animate({
                r: r,
                x: this.x - this.collapsedRadius,
                y: this.y - this.collapsedRadius,
                width: this.collapsedRadius * 2,
                height: this.collapsedRadius * 2
            }, 0, "linear");
        var self = this;
        $.each(this.relatedInterestNodes,
            function(i, ri) {
                ri.hideText();
                ri.animate(
                        { x: self.x, y: self.y },
                        400,
                        "backIn",
                        function () { ri.hide(); }
                );
            }
        );
        this.ring.animate(
                {r: 0}, 400, "backIn",
                function () {  self.state = self.STATE_COLLAPSED;}
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
        $.each(this.relatedInterestNodes,
                function (i, n) {
                    (n == relatedInterestNode) ? n.highlightOn() : n.highlightOff();
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
        this.centerNode.normal();
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





