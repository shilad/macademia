
macademia.nbrviz.person = macademia.nbrviz.person || {};

macademia.nbrviz.person.INTEREST_INCR = 100;

/**
 * The center for a person node (image + wedges).
 */
var PersonCenter = RaphaelComponent.extend({
    init : function(params) {
        this._super(params);

        // constants
        this.IMAGE_WIDTH = 20;
        this.IMAGE_HEIGHT = this.IMAGE_WIDTH * 194 / 130;
        this.LABEL_VERT_OFFSET = 13;
        this.LABEL_HORIZ_OFFSET = 13;

        // object properties
        this.interestGroups = params.interestGroups;
        this.imageWidth = params.imageWidth || this.IMAGE_WIDTH;
        this.imageHeight = params.imageHeight || this.IMAGE_HEIGHT;
        this.innerRadius = params.innerRadius || this.imageHeight * .6;
        this.outerRadius = params.outerRadius || this.innerRadius + 10;
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";

        var x = params.x, y = params.y;

        // Avatar for the person
        this.imageBg = this.paper.circle(x, y, this.innerRadius).attr({fill: "white"});
        this.image = this.paper.image(this.picture,
                x-this.imageWidth/2, y-this.imageHeight/2,
                this.imageWidth, this.imageHeight);

        // strokes and borders
        this.outerStroke = this.paper.circle(x, y, this.innerRadius+this.outerRadius).attr({stroke: "#999", "stroke-width": 1});
        this.innerStroke = this.paper.circle(x, y, this.innerRadius).attr({stroke: "#444", "stroke-width": 1});

        // wedges
        var self = this;
        this.wedges = [];
        $.each(this.interestGroups, function() {
            var ig = this[0];
            var color = self.fillHsb(ig.color);
            var section = self.paper.path().attr({stroke: color, opacity: 0});
            self.wedges.push(section);
        });
        this.nameText = this.paper.text().attr({
            text: this.name,
            x: x+this.LABEL_HORIZ_OFFSET,
            y: y+this.innerRadius+this.outerRadius+this.LABEL_HORIZ_OFFSET,
            font: macademia.nbrviz.mainFont
        });
        this.handle = this.paper.circle(x, y, this.innerRadius+this.outerRadius).attr({fill: "#fff", opacity: 0}).toFront();

        this.setPosition(x, y);

        // setup events
        this.installEventHandlers();
    },
    installEventHandlers : function() {
        this.hoverSet = new HoverSet(this.getLayers());
    },
    getLayers : function() {
        var layers = [ this.imageBg, this.image, this.outerStroke, this.innerStroke ];
        macademia.concatInPlace(layers, this.wedges);
        layers.push(this.nameText);
        layers.push(this.handle);
        return layers.reverse();
    },
    fillHsb : function(h) {
            return 'hsb(' + h + ',0.4,1)';
    },
    getHandle : function() { return this.handle; },
    getX : function() { return this.handle.attr('cx'); },
    getY : function() { return this.handle.attr('cy'); },
    normal : function() {},
    setPosition : function(x, y) {
        var circles = [this.handle, this.innerStroke, this.outerStroke, this.imageBg];
        $.each(circles, function() { this.attr({cx : x, cy : y}); });

        this.image.attr({
            x : (x - this.image.attr('width')/2),
            y : (y - this.image.attr('height')/2)
        });
        this.nameText.attr({
            x : (x - this.nameText.attr('width')/2),
            y : y+this.innerRadius+this.outerRadius+this.LABEL_HORIZ_OFFSET
        });
        var rectangles = [this.image, this.nameText];

        var self = this;
        var amount = 1.0;
        $.each(this.interestGroups, function(i) {
            var ig = this[0];
            var w = self.wedges[i];
            w.attr({personArc: [x, y, self.outerRadius, amount, self.innerRadius], opacity: 1});
            amount -= this[1];
        });

    },
    foo : false
});

/**
 * Person object constructor. params should have the following properties:
 * @ param collapsedRadius the size of the person, as measured by the width of the arc.
 * @ param interestGroups 2D array that determines the color slices on the person's circle by taking the proportions of his/her interestGroups.
 *         eg: [[interestGroup1, 0.3],[interestGroup2, 0.4],[interestGroup3, 0.3]]
 * @ param interests the person's interests that are related to the center  (Interest class)
 * @ param nonRelevantInterests greyed out interests that appear on mouseover that the person has but are not related to the center
 * @ param picture url to person's image
 * @ param name person's name
 * @ param paper the Raphael object you'd like to use. default is macademia.nbrviz.paper
 * @ author Emi Lim
 */
var Person = MNode.extend({
    init : function(params) {
        this._super(params);
        this.picture = params.picture || "";
        this.name = params.name || "nameless person";
        this.relevance = params.relevance || null;
        this.interestGroups = params.interestGroups || [];
        this.interestGroups.sort(function(a,b){
                return b[1] - a[1]
        });
        this.interests = this.sortAndColorInterests(params.interests, params.interestGroups);
        macademia.concatInPlace(this.interests, params.nonRelevantInterests || []);
        this.relatedInterests = this.interests;
    },
    sortAndColorInterests : function(interests, interestGroups){
        var sortedInterests = [];
        for (var i=0; i< interestGroups.length; i++){
            for (var j=0; j<interests.length; j++){
                if ($.inArray(interests[j], interestGroups[i][0].relatedInterests)+1){
                    interests[j].color = interestGroups[i][0].color;
                    sortedInterests.push(interests[j]);
                }
            }
        }
        return sortedInterests;
    },
    createCenterNode : function() {
        this.centerNode = new PersonCenter({
            interestGroups : this.interestGroups,
            name : this.name,
            picture : this.picture,
            x : this.x,
            y : this.y,
            outerRadius : this.collapsedRadius,
            paper : this.paper
        });
    },
    setPosition : function(x, y) {
        this._super(x, y);
        // change the color of the ring.
        this.ring.attr('fill', 'hsb(0,0,.8)');
        this.centerNode.setPosition(x, y);
    },
    foo : false
});


function Center(params){
    this.interestGroups = params.interestGroups || 0;
    this.paper = params.paper || macademia.nbrviz.paper;
    var xPos = macademia.nbrviz.paper.width/2,
        yPos = macademia.nbrviz.paper.height/2;
    macademia.nbrviz.paper.circle(xPos, yPos, 40).attr({fill: "r#fff-#000"});
    macademia.nbrviz.paper.ball(xPos, yPos, 40, "#333", "shilad", 0, 20);
    //creating conjoining connectors to interestclusters
    for (var i=0; i< this.interestGroups.length; i++){
        var color= macademia.nbrviz.makeHsb(this.interestGroups[i].color);
        this.paper.path("M"+ xPos+" "+yPos+"L"+this.interestGroups[i].xPos+ " "+this.interestGroups[i].yPos).attr({"stroke-width": 3, stroke: color}).toBack();
    }
}

