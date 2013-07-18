/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/16/13
 * Time: 1:25 PM
 * To change this template use File | Settings | File Templates.
 */

var MC = (window.MC = (window.MC || {}));


MC.InterestViz = function(params) {
    this.hubs = params.hubs;
//    this.people = params.people;
    this.root = params.root;
    this.svg = params.svg;
    this.hubModel = params.hubModel;
    this.circles = params.circles;
};


//Position the hubs and the root
MC.InterestViz.prototype.createInterestViz = function(){
    //Create root
    this.createHub();

    for(var i = 0; i < this.hubs.length; i++){
        //alter model for each hub
        console.log(this.hubs[i]);
        this.hubModel.id=this.hubs[i].id;
        this.hubModel.cx=this.hubs[i].cx;
        this.hubModel.cy=this.hubs[i].cy;
        this.hubModel.hubRoot=this.hubs[i];
        this.hubModel.children=this.hubs[i][0].interests;
        this.hubModel.color=this.hubs[i].color;
        this.createHub();
    }

};

//var hubCircles = [
//    {'id' : 34, 'type' : "person", 'name' : 'Eevee', 'color' : "tan", 'r': 30, 'cx' : 375, 'cy' : 425},
//    {'id' : 31, 'type' : "person",'name' : 'Flareon', 'color' : "red", 'r': 30, 'cx' : 375, 'cy' : 150},
//    {'id' : 10, 'type' : "person",'name' : 'Jolteon', 'color' : "yellow", 'r': 30, 'cx' : 150, 'cy' : 600},
//    {'id' : 19, 'type' : "person",'name' : 'Vaporeon', 'color' : "blue", 'r': 30, 'cx' : 600, 'cy' : 600}
//];
//var hubModel = {
//    id:7,
//    cx:375,
//    cy:425,
//    hubRoot : root,
//    children : root[0].interests,
//    color : 0.7,
//    distance: 100
//};
MC.InterestViz.prototype.createHub = function(){
    this.svg
        .datum(this.hubModel)
        .call(this.createHubView());
};

MC.InterestViz.prototype.createHubView = function(){
    this.hubView = MC.hub();
    return this.hubView;

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
            return d.r+100;
        })
        .attr("class","gradient");
};

//Create interest labels
MC.InterestViz.prototype.createInterestLabels = function(){
    this.svg
        .selectAll("text")
        .data(this.circles)
        .enter()
        .append("text")
        .attr("fill","green")
        .text(function(d){
            return d.name;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d) {
            return d.cx;
        })
        .attr("y", function(d) {
            return d.cy;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("stroke","black")
        .attr("stroke-width",".25");



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
        .attr("offset","20%") //20%
        .attr("style",function(d){
            return "stop-color:"+d.color+";stop-opacity:.5;";
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
}

//Sets the locations of the person heads
MC.InterestViz.prototype.createPersonLayoutView = function(){
    this.personLayoutView = MC.personLayout()
        .setPeopleNodes(this.getD3People())
        .setClusterMap(this.clusterMap)
        .setInterestNodes(this.getD3Interests());
    return this.personLayoutView;
};


