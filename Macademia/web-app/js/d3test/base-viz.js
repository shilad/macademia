var MC = (window.MC = (window.MC || {}));


MC.BaseViz = function(params) {
    this.clusterMap = params.clusterMap;
    this.people = params.people;
    this.interests = params.interests;
    this.svg = params.svg;
};

MC.BaseViz.prototype.createPersonView = function() {
    this.personView = MC.person();
    return this.personView;
};

MC.BaseViz.prototype.createPeople = function() {
    this.svg
        .selectAll('g.person')
        .data(this.people)
        .enter()
        .call(this.personView);
};

MC.BaseViz.prototype.createInterestView=function() {
    this.interestView=MC.interest();
    return this.interestView;
}  ;


MC.BaseViz.prototype.createInterests = function(){
     this.svg
         .attr('width', 800)
                .attr('height', 800)
                .selectAll('interests')
                .data(this.interests)
                .enter()
                .call(this.interestView);
}

