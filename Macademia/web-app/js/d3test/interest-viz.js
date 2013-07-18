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
    this.people = params.people;
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
        this.hubModel=hubModel = {
            id:this.hubs[i][0].id,
            cx:this.hubs[i][0].cx,
            cy:this.hubs[i][0].cy,
            hubRoot : this.hubs[i],
            children : this.hubs[i][0].interests,
            color : this.hubs[i][0].color,
            distance: 100
        };



        this.createHub();
    }

};

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
            return d.r;
        })
        .attr("class","gradient");
};

//Create interest labels                        NO LONGER USED
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
    console.log(this.getD3People());
    this.personLayoutView = MC.personLayout()
        .setPeopleNodes(this.getD3People())
        .setClusterMap(this.clusterMap)
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



