var MC = (window.MC = (window.MC || {}));


MC.BaseViz = function(params) {
    this.clusterMap = params.clusterMap;
    this.people = params.people;
    this.interests = params.interests;
    this.svg = params.svg;
    this.cloneInterests = params.cloneInterests;    // REMOVE ME

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
    // uses the interest view and the interest model to create the
    // svg interest elements and their d3 wrapper.
     this.svg
         .attr('width', 800)
                .attr('height', 800)
                .selectAll('interests')
                .data(this.interests)
                .enter()
                .call(this.interestView);
}

MC.BaseViz.prototype.getD3Interests = function() {
    return this.svg.selectAll('g.interest');
}

MC.BaseViz.prototype.getD3People = function() {
    return this.svg.selectAll('g.person');
}

MC.BaseViz.prototype.createInterestLayoutView = function(){
      this.interestLayoutView = MC.interestLayout()
          .setDiameter(500)
          .setRootId('18')
          .setInterests(this.cloneInterests)
          .setClusterMap(this.clusterMap)
          .setInterestNodes(this.getD3Interests());
             //makes a public variable
      return this.interestLayoutView;
}

MC.BaseViz.prototype.createInterestLayout = function(){
    this.svg
        .selectAll('interest-layouts')
        .data([0])
        .enter()
        .call(this.interestLayoutView);
}

MC.BaseViz.prototype.createPersonLayoutView = function(){
    this.personLayoutView = MC.personLayout()
        .setLinkDistance(10)
            .setGravity(.005)
            .setFriction(.8)
        .setPeopleNodes(this.getD3People())
        .setClusterMap(this.clusterMap)
        .setInterestNodes(this.getD3Interests());
    return this.personLayoutView;
}


MC.BaseViz.prototype.createPersonLayout = function(){
    this.svg
        .selectAll('person-layouts')
        .data([0])
        .enter()
        .call(this.personLayoutView);
}