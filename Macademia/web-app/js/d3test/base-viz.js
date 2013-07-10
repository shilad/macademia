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

//works up to this point?

MC.BaseViz.prototype.createInterestNodes = function(){
    this.interestNodes = d3.selectAll('g.interest');
    return this.interestNodes;
}

MC.BaseViz.prototype.createPersonNodes = function(){
    this.personNodes = d3.selectall('g.person');
    return this.personNodes;

}

MC.BaseViz.prototype.createInterestLayout = function(){
    this.cloneInterests=MC.cloneInterests;
    this.interestLayout = MC.interestLayout()
        .setDiameter(500)
        .setInterests(this.cloneInterests)
        .setClusterMap(this.clusterMap)
        .setRootId('18')
        .setInterestNodes(this.interestNodes);
}

//MC.BaseViz.prototype.createPersonLayout = MC.personLayout(){
//    this.personLayout=MC.personLayout()
//        .setLinkDistance(10)
//        .setGravity(.005)
//        .setFriction(.8)
//        .setPeopleNodes(this.personNodes)
//        .setClusterMap(this.clusterMap)
//        .setInterestNodes(this.interestNodes);
//
//
//}

