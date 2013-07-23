/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/16/13
 * Time: 1:25 PM
 * To change this template use File | Settings | File Templates.
 */

var MC = (window.MC = (window.MC || {}));

MC.postions = [
    [], // 1 hub case
    [], // 2 hub case
    [{x:0.5,y:0.5},{x:0,y:1},{x:1,y:1},{x:1,y:0}], // 3 hub case (root, hub1, hub2, hub3)
    [] // 4 hub case
];
/**
 * TODO: calculate circles instead of passing them in.
 * @param params
 * @constructor
 */


MC.InterestViz = function(params) {
    this.hubs = params.hubs;
    this.people = params.people;
    this.root = params.root;
    this.svg = params.svg;

    this.svgWidth = this.svg.attr("width");
    this.svgHeight = this.svg.attr("height");

    this.circles = params.circles;
    this.interests = params.interests;
    this.colors = params.colors;

    this.container=this.svg.append("g").attr("class","viz").attr('width', 1000).attr('height', 1000);
    // construct the hubModel here based on other parameters
    this.hubModel = params.hubModel;

    //Positioning hubModel(visRoot) and hubs around it
//    this.positionHubModel();
//    this.postionHubs();

//    this.setGradients();
//    this.createsGradientCircles();
    this.currentColors = [];
    this.calculatePositions();
    this.calculateColors();
    this.setGradients();
    this.createsGradientCircles();
    this.createInterestViz();
    this.startPeople();

};



// Position the hubs around the visRoot
MC.InterestViz.prototype.postionHubs = function(){
    var n = this.hubs.length;

    if(n == 3){
        //Setting the first hub on the top
        this.hubs[0][0].cx = this.svgWidth/2;
        this.hubs[0][0].cy = 0;

        //Setting the second hub
        this.hubs[1][0].cx = 0;
        this.hubs[1][0].cy = this.svgHeight;

        //Setting the third hub
        this.hubs[2][0].cx = this.svgWidth;
        this.hubs[2][0].cy = this.svgHeight;

        console.log(this.hubs);
    }

    // applying the padding
    var dist = this.hubModel.distance; //use the distance between the root and child as padding
    var scale = 1.5;
    var padL = dist * scale; //left
    var padR = this.svgWidth - dist * scale; //right
    var padT = dist * scale; //top
    var padB = this.svgHeight - dist * scale; //bottom

    for(var i=0; i<n; i++){

        //Left
        if(this.hubs[i][0].cx < padL){
            this.hubs[i][0].cx = padL;
        }

        //Right
        if(this.hubs[i][0].cx > padR){
            this.hubs[i][0].cx = padR;
        }

        //Top
        if(this.hubs[i][0].cy < padT){
            this.hubs[i][0].cy = padT;
        }

        //Bottom
        if(this.hubs[i][0].cy > padB){
            this.hubs[i][0].cy = padB;
        }

    }

}

// Position the center of the hubModel(visRoot) to the enter of the SVG canvas
MC.InterestViz.prototype.positionHubModel = function(){
    var x = this.svgWidth/2;
    var y = this.svgHeight/2;

    this.hubModel.cx = x;
    this.hubModel.cy = y;
}


MC.InterestViz.prototype.calculatePositions = function() {
    this.root.cx = 375;
    this.root.cy = 425;
    this.hubs[0].cx = 375;
    this.hubs[0].cy = 150;
    this.hubs[1].cx = 150;
    this.hubs[1].cy = 600;
    this.hubs[2].cx = 600;
    this.hubs[2].cy = 600;
};

MC.InterestViz.prototype.calculateColors = function() {
    // assign interest colors to hubs
    var interestColors = {};
    if (this.root.color) {
        this.currentColors.push(this.root.color);
    } else {
        this.root.color = this.makeColorful();
    }

    interestColors[this.root.id] = this.root.color;
    for (var i = 0; i < this.hubs.length; i++) {
        this.hubs[i].color = this.makeColorful();
        interestColors[this.hubs[i].id] = this.hubs[i].color;
    }

    // assign interest colors to people
    for (var pid in this.people) {
        this.people[pid].interestColors = interestColors;
    }
};

MC.InterestViz.prototype.startPeople = function() {

    window.setTimeout( jQuery.proxy(function() {
        this.createInterestColors();
        this.createPersonView();
        this.createPeople();
        this.createPersonLayoutView()
        this.createPersonLayout();
    }, this), MC.hub().getDuration());

}

//Position the hubs and the root
MC.InterestViz.prototype.createInterestViz = function() {
    this.createHub(this.root);
    for(var i = 0; i < this.hubs.length; i++) {
        this.createHub(this.hubs[i]);
    }
};

MC.InterestViz.prototype.createInterestColors = function(){
    var interestColors ={};

    for(var i = 0; i < this.people.length; i++){
        for(var j = 0; j< this.people[i].interests.length; j++){
            for(var k = 0; k< this.hubs.length; k++){
                for(var l =0; l< this.hubs[k][0].interests.length;l++){

                    if(this.people[i].interests[j] == this.hubs[i][0].interests[j].id){
                        interestColors[this.people[i].interests[j]] = this.hubs[i][0].color; //creates a map with interest id and color assigned to that id
                    }

//            if(this.hubs[i][0].interests)
//            if{this.hubs[i][0]==}
//            interestColors[this.people[i].interests[j]] = this.hubs[i][0].color; //creates a map with interest id and color assigned to that id
                };
            };
        };
    };

};

MC.InterestViz.prototype.createHub = function(model) {
    var hubInterests = [];
    for (var i = 0; i < model.children.length; i++) {
        var childId = model.children[i];
        hubInterests.push(this.interests[childId]);
    }
    var rootModel = model.type == 'person' ? this.people[model.id] : this.interests[model.id];
    rootModel.type = model.type;

    this.container
        .datum({
            id : model.id,
            children : hubInterests,
            root : rootModel,
            color : model.color,
            isVizRoot : (model == this.root),
            cx : model.cx,
            cy : model.cy,
            distance : 100
        })
        .call(MC.hub());
};

MC.InterestViz.prototype.createsGradientCircles = function(){
    this.container.selectAll('circle.gradient')
        .data(this.circles)
        .enter()
        .append("circle")
        .attr('fill', function(d) {
            return 'url(#gradient_' + d.id + ')';
        })
        .attr('cx', function(d) {
            return d.cx;
        })
        .attr('cy', function(d) {
            return d.cy;
        })
        .attr('r', function(d) {
            return d.r;
        })
        .attr("class","gradient");
};


MC.InterestViz.prototype.setGradients = function(){
    var defs = this.container
        .selectAll("defs")
        .data(this.container[0])
        .enter()
        .append('defs');

    var rGs = defs
        .selectAll("radialGradient")
        .data(this.circles)
        .enter()
        .append('radialGradient')
        .attr("id",function(d){
            return "gradient_"+ d.id;
        });
    rGs
        .append("stop")
        .attr("offset","20%")
        .attr("style",function(d){
            return "stop-color:"+d.color+";stop-opacity:"+ d['stop-opacity']+";";
        });
    rGs
        .append("stop")
        .attr("offset","100%")
        .attr("style",function(d){
            return "stop-color:"+d.color+";stop-opacity:0;";
        });


};

/*
 * Methods for the people heads are below here-----
 */


MC.InterestViz.prototype.getD3Interests = function() {
    return this.container.selectAll('g.interest');
};

//return a person view
MC.InterestViz.prototype.createPersonView = function() {
    this.personView = MC.person();
    return this.personView;
};

//Creates the floating people heads
MC.InterestViz.prototype.createPeople = function() {
    this.container
        .selectAll('g.person')
        .data(this.people)
        .enter()
        .call(this.personView);
};

//Grabs all the people in svg
MC.InterestViz.prototype.getD3People = function() {
    return this.container.selectAll('g.person');
};

//Sets the locations of the person heads
MC.InterestViz.prototype.createPersonLayoutView = function(){
    this.personLayoutView = MC.personLayout()
        .setPeopleNodes(this.getD3People())
        .setClusterMap(this.createClusterMap())
        .setInterestNodes(this.getD3Interests());
    return this.personLayoutView;
};

MC.InterestViz.prototype.createPersonLayout = function(){
    this.container
        .selectAll('person-layouts')
        .data([0])
        .enter()
        .call(this.personLayoutView);
};


MC.InterestViz.prototype.createClusterMap = function(){
    var clusterMap = {};
    clusterMap[this.root.id] = this.root.children;
    for(var i = 0; i < this.hubs.length; i++){
        clusterMap[this.hubs[i].id] = this.hubs[i].children;
    };

    return clusterMap;
};
//I could not think of a better name it sets both the hub and interest colors from the color scheme
MC.InterestViz.prototype.makeColorful = function(){
    var color;
    //the colors already on the page

    for(var i = 0; i < this.colors.length; i++){
        if(this.currentColors.indexOf(this.colors[i])<0){
            color=this.colors[i];
            this.currentColors.push(color);
            return color;
        };

    };



};





