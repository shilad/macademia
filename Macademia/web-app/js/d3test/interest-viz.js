/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/16/13
 * Time: 1:25 PM
 * To change this template use File | Settings | File Templates.
 */

var MC = (window.MC = (window.MC || {}));


MC.InterestViz = function(params) {
//    this.hubs = params.hubs;
//    this.people = params.people;
//    this.root = params.root;
//    console.log(params);
    this.svg = params.svg;
    this.circles = params.circles;
};

MC.InterestViz.prototype.createsCircles = function(){
    this.svg.selectAll("circle")
        .data(this.circles)
        .enter()
        .append("circle")
        .attr("fill",function(d){
             return d.color;
        })
       .attr("r",function(d){
            return d.r;
        })
       .attr("cx",function(d){
            return d.cx;
       })
        .attr("cy",function(d){
            return d.cy;
        });
}

//Position the hubs and the root
MC.InterestViz.prototype.createInterestViz = function(){

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
    var defs = this.svg.append('svg:defs');

    defs.append('svg:linearGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0).attr('x2', 20).attr('y2', 0)
        .attr('id', 'master').call(
        function(gradient) {
            gradient.append('svg:stop').attr('offset', '0%').attr('style', 'stop-color:rgb(0,0,0);stop-opacity:1');
            gradient.append('svg:stop').attr('offset', '100%').attr('style', 'stop-color:rgb(0,0,0);stop-opacity:0');
        });


    defs.selectAll('.gradient').data(this.circles)
        .enter().append('svg:linearGradient')
        .attr('id', function(d, i) { return 'gradient' + i; })
        .attr('class', 'gradient')
        .attr('xlink:href', '#master')
        .attr('gradientTransform', function(d) { return 'translate(' + d[1] + ')'; });

    this.svg.selectAll('circles').data(this.circles)
        .enter().append('circles')
        .attr('fill', function(d, i) { return 'url(#gradient' + i + ')'; })
        .attr('x', 0)
        .attr('y', function(d, i) { return (i+1) * 20; });
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


