
macademia.nbrviz.interest = macademia.nbrviz.interest || {};

/**
 * Interest Cluster constructor.
 * @param params A dictionary consisting of keys:
 *  relatedInterests : a list of RelatedInterest objects.
 *  color : An integer representing hue between 0 and 1
 *  name : label for cluster or not?
 *  TODO: pass main interest info as interest object.
 */
var InterestCluster = MNode.extend({
    init : function(params) {
        if (params.subclusters) {
            params.relatedInterests = $.map(
                    params.subclusters,
                    function(sc) {
                        return params.interests[sc.id];
                    }
            );
        }
        this.interest = params.interest;
        this.subclusters = params.subclusters;
        this.inQuery = params.inQuery;

        // Invoke superclass constructor
        this._super(params);

        this.clusterId = params.clusterId;
        this.interest = new Interest(params);
        this.fadeLayer = null;

        if(params.name) {
            this.name = params.name;
            this.hasCenter = true;
        } else {
            this.name = this.retrieveClusterName();
            this.hasCenter = false;
        }
        if (this.isSubcluster()) {
            this.expandedHandleRadius = params.expandedHandleRadius || this.expandedRadius;
        } else {
            var self = this;
            // set up event handling...
            $.each(this.subclusters, function(i, sc) {
                    sc.setPosition(0, 0);
                    self.hoverSet.addAll(sc.getLayers());
                    sc.hide();
                    sc.hover(
                        function() { self.onSubclusterHoverIn(sc); },
                        function() { self.onSubclusterHoverOut(sc); }
                    );
            });
//            for (var i = 0; i < params.subclusters.length; i++) {
//                var sc = this.subclusters[i];
//                var i = this.relatedInterests[i];
//            }
        }
    },

    isSubcluster : function() {
        return !this.subclusters || !this.subclusters.length;
    },

    /**
     * Takes an array of the names of related interests, finds the
     * two shortest names and returns a short string depending on
     * the number of related interests. Ex: "interest1, interest2, ..."
     */
    retrieveClusterName : function() {
        var clusterName = "";
        var shortOne = "";
        var shortTwo = "";

        if(this.relatedInterests.length == 1) {
            return this.relatedInterests[0].name;
        } else if(this.relatedInterests == 2) {
            shortOne = this.relatedInterests[0].name;
            shortTwo = this.relatedInterests[1].name;
        } else {
            for(var i in this.relatedInterests) {
                if((this.relatedInterests[i].name.length < shortOne.length || shortOne == "") && this.relatedInterests[i].name != "") {
                    shortTwo = shortOne;
                    shortOne = this.relatedInterests[i].name;
                } else if((this.relatedInterests[i].name.length < shortTwo.length || shortTwo == "") && this.relatedInterests[i].name != "") {
                    shortTwo = this.relatedInterests[i].name;
                }
            }
        }
        clusterName = shortOne + ", " + shortTwo + ", ...";
        return clusterName;
    },

    createCenterNode : function() {
        this.centerNode = new InterestSphere({
                x : this.x, y : this.y,
                r : this.collapsedRadius,
                hue : this.color,
                name : this.name,
                xOffset : 0,
                interest : this.interest,
                yOffset : this.collapsedRadius + 10,
                labelBgOpacity : 0.2,
                inQuery : this.inQuery,
                paper : this.paper
            });
    },

    onMouseMove : function(e) {
        if (this.state != this.STATE_EXPANDED) {
            return;
        }
        if (macademia.nbrviz.distance(this.x, this.y, e.x, e.y) <= this.centerNode.r*1.5) {
            var last = this.lastInterestHoverIndex;
            if (this.lastInterestHoverIndex != this.HOVER_CENTER) {
                this.lastInterestHoverIndex = this.HOVER_CENTER;
                this.centerNode.highlightOn();
                this.onInterestHoverIn(this.interest, this.centerNode);
                if (last > 0) {
                    this.onInterestHoverOut(
                        this.relatedInterests[last],
                        this.relatedInterestNodes[last]);
                }
            }
        } else {
            this.centerNode.highlightOff();
            this._super(e);
        }
    },

    onInterestHoverIn : function(relatedInterest, relatedInterestNode) {
        if (this.subclusters && relatedInterest.id != this.id) {
            var sc = null;
            for (var i = 0; i < this.subclusters.length; i++) {
                if (this.subclusters[i].id == relatedInterest.id) {
                    sc = this.subclusters[i];
                    break;
                }
            }
            if (sc == null) {
                alert('did not find subcluster for ' + relatedInterest.name);
                return;
            }
            if (sc.relatedInterests.length == 0) {
                this._super(relatedInterest, relatedInterestNode);
                return;
            }
            // push the position out by 20% to leave more room for mousing out
            var x = this.x + 1.4*(relatedInterestNode.getX() - this.x);
            var y = this.y + 1.4*(relatedInterestNode.getY() - this.y);
            sc.setPosition(x, y);
            sc.show();
            sc.toFront();
            sc.expand();
            this.raiseFadeLayer(sc.getBottomLayer());
        } else {
            this._super(relatedInterest, relatedInterestNode);
        }
    },
    onInterestHoverOut : function(relatedInterest, relatedInterestNode) {
//        console.log('on interest hover out ' + relatedInterest.name);
        if (this.subclusters) {
        } else {
            this._super(relatedInterest, relatedInterestNode);
        }
    },
    raiseFadeLayer : function(inBackOf) {
        if (this.fadeLayer != null) {
            this.fadeLayer.remove();
        }
        var bbox = this.getLayerSet().getBBox();
        this.fadeLayer = this.paper.rect(bbox.x, bbox.y, bbox.width, bbox.height)
        this.fadeLayer.attr({'fill' : '#fff', 'fill-opacity' : 0.7, 'stroke-width' : 0});
        this.fadeLayer.insertBefore(inBackOf);
        this.hoverSet.add(this.fadeLayer);
    },
    lowerFadeLayer : function() {
        if (this.fadeLayer != null) {
            this.fadeLayer.remove();
            this.fadeLayer = null;
        }
    },
    createOneRelatedInterestNode : function(interest, pos, textPos) {
        var node = this._super(interest, pos, textPos);
        if (this.subclusters) {
            var i = $.inArray(interest, this.relatedInterests);
            var n = this.subclusters[i].relatedInterests.length;
            node.addOrbit(n);
        }
        return node;
    },
    onHoverIn : function() {
//        console.log('on hover in ' + this.name);
        this._super();
    },
    onHoverOut : function() {
//        console.log('on hover out ' + this.name);
        this.lowerFadeLayer();
        this._super();
        this.centerNode.highlightNone();
        if (!this.isSubcluster()) {
            $.each(this.subclusters, function(i, sc) {sc.hide();});
        }
    },
    onSubclusterHoverIn : function(sc) {
//        console.log('on subcluster hover in ' + this.name);
    },
    onSubclusterHoverOut : function(sc) {
//        console.log('on subcluster hover out ' + this.name);
        sc.hide();
        this.lowerFadeLayer();
    }
});



/**
 * relatedInterest object constructor
 * @ param color of the relatedInterest (a hue between 0 and 1)
 * @ author Emi Lim
 */
function Interest(params) {
    this.id = params.id;
    this.name = params.name;
    this.color = params.color;
    this.relevance = params.relevance || 1.0;
    this.relatedQueryId = params.relatedQueryId || -1;
}