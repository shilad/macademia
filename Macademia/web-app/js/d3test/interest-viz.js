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


MC.InterestViz = function(params) {
    this.hubs = params.hubs;
    this.people = params.people;
    this.root = params.root;
    this.svg = params.svg;

    this.svgWidth = this.svg.attr("width");
    this.svgHeight = this.svg.attr("height");

    this.circles = params.circles;
    this.colors = params.colors;

    this.svg=this.svg.append("g").attr("class","viz");

    // construct the hubModel here based on other parameters
    this.hubModel = params.hubModel;
    this.currentColors = [];
    this.setGradients();
    this.createsGradientCircles();

    //Positioning hubModel(visRoot) and hubs around it
//    this.positionHubModel();
//    this.postionHubs();

//    this.setGradients();
//    this.createsGradientCircles();
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
    this.createHub(this.hubModel);
//    console.log(this.hubModel);
    for(var i = 0; i < this.hubs.length; i++){

        //alter model for each hub
        var color = this.makeColorful();
        this.hubs[i][0].color = color;  //sets the center circle color

        this.createHub({
            id:this.hubs[i][0].id,
            cx:this.hubs[i][0].cx,
            cy:this.hubs[i][0].cy,
            hubRoot : this.hubs[i],
            children : this.hubs[i][0].interests,
//            color : this.makeColorful(),
            distance: 80
            color : color,    //sets the little circles to the center circles color
            distance: 100
        });
//        console.log(this.hubModel);
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

MC.InterestViz.prototype.createHub = function(model){
    this.svg
        .datum(model)
        .call(MC.hub());
};

MC.InterestViz.prototype.createsGradientCircles = function(){
    this.svg.selectAll('circle.gradient')
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
    var defs = this.svg
        .selectAll("defs")
        .data(this.svg[0])
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

MC.InterestViz.prototype.createClusterMap = function(){
    var clusterMap={};
    var temp=[];
    var id;
    for(var j = 0; j < this.root[0].interests.length; j++){
        id = this.root[0].interests[j].id;
        temp.push(id);
    }
    clusterMap[this.root[0].id]=temp;
    temp=[];
    for(var i = 0; i < this.hubs.length; i++){
        for(var j = 0; j < this.hubs[i][0].interests.length; j++){
            var id = this.hubs[i][0].interests[j].id;
            temp.push(id);
        }
        clusterMap[this.hubs[i][0].id]=temp;
        temp=[];
    }
    this.clusterMap=clusterMap;
};

/*
 * Methods for the people heads are below here-----
 */


MC.InterestViz.prototype.getD3Interests = function() {
    return this.svg.selectAll('g.interest');
};

//return a person view
MC.InterestViz.prototype.createPersonView = function() {
    this.personView = MC.person();
    return this.personView;
};

//Creates the floating people heads
MC.InterestViz.prototype.createPeople = function() {
    this.svg
        .selectAll('g.person')
        .data(this.people)
        .enter()
        .call(this.personView);
};

//Grabs all the people in svg
MC.InterestViz.prototype.getD3People = function() {
    return this.svg.selectAll('g.person');
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
    this.svg
        .selectAll('person-layouts')
        .data([0])
        .enter()
        .call(this.personLayoutView);
};


MC.InterestViz.prototype.createClusterMap = function(){
    var clusterMap = {};
    clusterMap[this.root[0].id]=this.root[0].interests;
    for(var i = 0; i < this.hubs.length; i++){
        clusterMap[this.hubs[i][0].id] = this.hubs[i][0].interests;
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





