
macademia.nbrviz.interest = macademia.nbrviz.interest || {};

/**
 * Interest Cluster constructor.
 * @param params A concepts consisting of keys:
 *  relatedInterests : a list of RelatedInterest objects.
 *  color : An integer representing hue between 0 and 1
 *  name : label for cluster or not?
 *  TODO: pass main interest info as interest object.
 */
var InterestCluster = MNode.extend({
    init : function(params) {
        this.interest = params.interest;
        this.clickText = params.clickText;

        // Invoke superclass constructor
        this._super(params);

        this.clusterId = params.clusterId;
        this.interest = new Interest(params);
        this.fadeLayer = null;
        this.type = 'interest';

        if(params.name) {
            this.name = params.name;
            this.hasCenter = true;
        } else {
            this.name = this.retrieveClusterName();
            this.hasCenter = false;
        }
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
        this.centerNode = new LabeledSphere({
                x : this.x, y : this.y,
                r : this.collapsedRadius,
                hue : this.color,
                name : this.name,
                xOffset : 0,
                scale : this.scale,
                interest : this.interest,
                yOffset : this.collapsedRadius + 10,
                labelBgOpacity : 0.2,
                clickText : this.clickText,
                paper : this.paper
            });
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