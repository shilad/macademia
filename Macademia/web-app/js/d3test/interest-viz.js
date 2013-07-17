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

MC.InterestViz.prototype.getStops = function(){
    return this.svg.selectAll("g.interest");
//            return [{"p":"0%","g":"stop-color:"+ d.id.color+";stop-opacity:1"},
//                {"p":"100%","g":"stop-color:"+ d.id.color+";stop-opacity:0"}];

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
//        .select("radialGradient#gradient_19")
        .data(this.getStops())
        .enter()
        .append("stop")
        .attr("offset", function(d){
            return d.p;
        })
        .attr("style", function(d){
            return d.g;
        });

    this.svg.selectAll('circle')
        .data(this.circles)
        .attr('fill', function(d) {
            return 'url(#gradient' + d.id + ')';
        })
        .attr('cx', function(d) {
            return d.cx;
        })
        .attr('cy', function(d) {
            return d.cy;
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


