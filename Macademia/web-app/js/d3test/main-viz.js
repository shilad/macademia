/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/19/13
 * Time: 2:50 PM
 * To change this template use File | Settings | File Templates.
 */
var MC = (window.MC = (window.MC || {}));


MC.MainViz = function(params) {
    this.hubs = params.hubs;
    this.people = params.people;
    this.root = params.root;
    this.svg = params.svg;
    this.circles = params.circles;
    this.colors = params.colors;
    this.hubModel = params.hubModel;

    this.viz = new MC.InterestViz({
        hubModel: this.hubModel,
        hubs: this.hubs,
        root: this.root,
        people: this.people,
        circles: this.circles,
        svg : this.svg,
        colors : this.colors
    });
    this.setEventHandlers();

};

MC.MainViz.prototype.setEventHandlers = function(){
    this.setInterestEventHandler();
    this.setPeopleEventHandler();
}
MC.MainViz.prototype.setInterestEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {

        this.svg
            .selectAll("g.interest, g.hubRoot")
            .on("click",jQuery.proxy(function(e){
                //
                console.log(e);
                //This if else should be removed once we have real data
                var i={};
                if(!e.interests){
                    i['interests']=this.root[0].interests;

                }
                else{
                    i['interests']= e.interests;

                }
                i['id']= e.id;
                i['name']= e.name;
                this.root = [{
                    "isVizRoot":true,
                    "id": i.id,
                    'name': i.name,
                    'type':'interest',
                    'r': 45,
                    'color': '#D3D3D3',
                    'interests' : i.interests
                }];
                this.hubModel = {
                    id: i.id,
                    cx:375,
                    cy:425,
                    hubRoot : this.root,
                    children : this.root[0].interests,
                    color: 'hsl(0, 0, 82.7)',
                    distance: 100
                };

                this.svg.select("g.viz").remove();
//            console.log(e.name);
                this.viz = new MC.InterestViz({
                    hubModel: this.hubModel,
                    hubs: this.hubs,
                    root: this.root,
                    people: this.people,
                    circles: this.circles,
                    svg : this.svg,
                    colors : this.colors
                });
//            console.log(e);
                this.setEventHandlers();
            },this));
    }, this), MC.hub().getDuration());
};
MC.MainViz.prototype.setPeopleEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {

        this.svg
            .selectAll("g.person")
            .on("click",jQuery.proxy(function(e){
                //
                console.log(e);
                //This if else should be removed once we have real data
                var i={};

                i['interests']= this.root[0].interests;
                i['id']= e.id;
                i['name']= e.name;
                i['cleanedRelevance']= e.cleanedRelevance;
                i['relevance']= e.relevance;
                i['interestColors']= e.interestColors;

                this.root = [{
                    "isVizRoot":true,
                    "id": i.id,
                    'name': i.name,
                    'pic' : '/Macademia/all/image/randomFake?foo',
                    'cleanedRelevance': i.cleanedRelevance,
                    'interestColors': i.interestColors,
                    'type':'person',
                    'r': 45,
                    'interests': i.interests
                }];
                this.hubModel = {
                    id: i.id,
                    cx:375,
                    cy:425,
                    hubRoot : this.root,
                    children : this.root[0].interests,
                    color: 'hsl(0, 0, 82.7)',
                    distance: 100
                };

                this.svg.select("g.viz").remove();
//            console.log(this.root);
                this.viz = new MC.InterestViz({
                    hubModel: this.hubModel,
                    hubs: this.hubs,
                    root: this.root,
                    people: this.people,
                    circles: this.circles,
                    svg : this.svg,
                    colors : this.colors
                });
//            console.log(e);
                this.setEventHandlers();
            },this));
    }, this), MC.hub().getDuration());
};