
macademia.nbrviz.person = macademia.nbrviz.person || {};

/**
 * Person object constructor. params should have the following properties:
 * @ param strokeWidth the size of the person
 * @ param interestGroups 2D array that determines the color slices on the person's circle by taking the proportions of his/her interestGroups.
 *         eg: [[interestGroup1, 0.3],[interestGroup2, 0.4],[interestGroup3, 0.3]]
 * @ param interests the person's interests that are related to the center  (RelatedInterest class)
 * @ param nonRelevantInterests greyed out interests that appear on mouseover that the person has but are not related to the center
 * @ param filepath to person's image
 * @ param name person's name
 * @ param paper the Raphael object you'd like to us. default is macademia.nbrviz.paper
 * @ author Emi Lim
 */
function Person(params) {
    // object properties
    this.interestGroups = params.interestGroups || [];
    this.interestGroups.sort(function(a,b){
            return b[1] - a[1]
    });
    this.xPos = macademia.nbrviz.paper.width/4;
    this.yPos = macademia.nbrviz.paper.height/4;
    this.strokeWidth = params.strokeWidth || 1;
    this.interests = this.sortAndColorInterests(params.interests, params.interestGroups).concat(params.nonRelevantInterests) || [];
//    console.log('params.interests ' + params.interests.length + ' ' + params.interestGroups.length + ' ' + this.interests.length);
    this.paper = params.paper || macademia.nbrviz.paper;
    this.picture = params.picture || "";
    this.name = params.name || "nameless person";

}


/**
 * Must be called to complete initialization of the person.
 * @param x
 * @param y
 */
Person.prototype.setPosition = function(x, y) {
    this.xPos = x;
    this.yPos = y;
    this.triggerSet = this.paper.set(),
    this.innerCircle = 30;

    // variables
    var strokeBorderWidth = 1,
        innerCircle = 30,
        triggerSet = this.paper.set(),
        imageSize = 60;

    // strokes and borders
    this.paper.circle(this.xPos, this.yPos, this.innerCircle+strokeBorderWidth/2+this.strokeWidth).attr({stroke: "#aaa", "stroke-width": strokeBorderWidth});
    this.paper.circle(this.xPos, this.yPos, this.innerCircle-strokeBorderWidth/2).attr({stroke: "#000", "stroke-width": strokeBorderWidth});

    // Avatar for the person
    var img = this.paper.image(this.picture, this.xPos-imageSize/2, this.yPos-imageSize/2, imageSize, imageSize).toBack();
//    this.triggerSet.push(img);

    // initializing nodes
    this.interestNodes = this.initializeInterests();
    this.positions = macademia.nbrviz.calculateRelatedInterestPositions(this.interests, this.strokeWidth+60, this.xPos, this.yPos, -Math.PI/3, Math.PI + Math.PI/3);
    this.nodePositions = this.positions[0];
    this.textPositions = this.positions[1];
    this.textLabelTriggers = this.initializeInterestTextLabels();
    this.text = this.paper.set();


    // creating the arc
    var color = this.fillHsb(this.interestGroups[0][0].color);
    var base = this.paper.path().attr({personArc: [this.xPos, this.yPos, this.strokeWidth, 0.1, this.innerCircle], stroke: color, opacity: 0});
    base.animate({personArc: [this.xPos, this.yPos, this.strokeWidth, 1, this.innerCircle], stroke: color, opacity: 1}, 500, "linear");
//    this.triggerSet.push(base);
    if (this.interestGroups.length > 1){
        var amount = 1;
        for (var j = 1; j < this.interestGroups.length; j++){
            color = this.fillHsb(this.interestGroups[j][0].color);
            amount -= this.interestGroups[j-1][1];
            var section = this.paper.path().attr({personArc: [this.xPos, this.yPos, this.strokeWidth, 0.1, this.innerCircle], stroke: color, opacity: 0});
            section.animate({personArc: [this.xPos, this.yPos, this.strokeWidth, amount, this.innerCircle], stroke: color, opacity: 1}, 500 * amount, "linear");
//            this.triggerSet.push(section);
        }
    }

    //creating the name label
    var nameText = this.paper.text().attr({text: this.name, x: this.xPos+3, y: this.yPos+this.innerCircle+this.strokeWidth+13, font: '20px Helvetica, Arial'});
    this.triggerSet.push(nameText);


    //mouse actions
    var self = this;
    this.growingTrigger = this.paper.circle(this.xPos, this.yPos, this.innerCircle+this.strokeWidth).attr({fill: "#fff", opacity: 0}).toFront();
    this.triggerSet.push(this.growingTrigger);

    this.triggerSet.hover(function () {
        self.showInterests();
    }, function() {
        self.hideInterests();
    });
};


// function to show the interests
 Person.prototype.showInterests = function(){
     var self = this;
     $.each(self.interestNodes, function(i){
         self.text.push(self.paper.text(self.textPositions[i][0], self.textPositions[i][1], self.interests[i].name).attr({font: '15px Helvetica, Arial', stroke: "#fff", "stroke-width": 1, fill: "#000", "stroke-opacity": 0.4}));
         self.textLabelTriggers[i].animate({width:90},100,"linear").toFront();
         self.interestNodes[i].animate({cx: self.nodePositions[i][0], cy:self.nodePositions[i][1], r:macademia.nbrviz.interest.nodeRadius},200,"elastic");
//         self.interestNodes[i].animate({cx: self.nodePositions[i][0], cy:self.nodePositions[i][1], r:macademia.nbrviz.interest.nodeRadius},200,"elastic").toFront();
    });
    self.growingTrigger.animate({r:this.strokeWidth+60}, 100, "linear");
};

// function to hide the interests
Person.prototype.hideInterests = function(){
     var self = this;
    $.each(self.interestNodes, function(index, node){
        node.animate({cx: self.xPos, cy:self.yPos, r:0},200,"<");
    });
    $.each(self.text, function(index, t){
        t.remove();
    });
    $.each(self.textLabelTriggers, function(index, label){
        label.animate({width:0}, 100, "linear");
    });
    self.growingTrigger.animate({r:this.innerCircle+this.strokeWidth},100, "linear");
};

Person.prototype.hover = function(mouseOver, mouseOut){
    this.growingTrigger.hover(mouseOver, mouseOut);
};

//Person.prototype.hoverInterest = function(mouseOver, mouseOut){
//    this.interestNodes.hover(mouseOver, mouseOut);
//    this.textLabelTriggers.hover(mouseOver, mouseOut)
//};

// function to intialize interests as 0 radius circles with a certain color
Person.prototype.initializeInterests = function(){
        var interestNodes = this.paper.set();
        for (var i = 0; i<this.interests.length; i++){
            var fill = this.fillHsb(this.interests[i].color);
            var interestNode = macademia.nbrviz.paper.circle(this.xPos, this.yPos, 0)
                            .attr({fill: fill})
                            .toFront();
            interestNodes.push(interestNode);
            this.triggerSet.push(interestNode);
        }
        return interestNodes
};

Person.prototype.initializeInterestTextLabels = function(){
    var labels = this.paper.set();
    for (var i = 0; i < this.interests.length; i++){
        var label = this.paper.rect(this.textPositions[i][0]-45, this.textPositions[i][1]-10, 0, 30).attr({fill: "#fff", opacity: 0, "stroke-width":0, r:10});
        this.triggerSet.push(label);
        labels.push(label);
    }
    return labels;
};

// This function takes the interests of the person and sorts them according to the order of
// the interestgroups, and gives them a color each
Person.prototype.sortAndColorInterests = function(interests, interestGroups){
    var sortedInterests = [];
    for (var i=0; i< interestGroups.length; i++){
        for (var j=0; j<interests.length; j++){
            if ($.inArray(interests[j], interestGroups[i][0].relatedInterests)+1){
                sortedInterests.push(interests[j]);
                interests[j].color = interestGroups[i][0].color;
            }
        }
    }
    return sortedInterests;
};

Person.prototype.fillHsb = function(h) {
    return 'hsb(' + h + ',0.4,1)';
};


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

