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

    this.setInterestEventHandler();
};

MC.MainViz.prototype.setInterestEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {

    this.svg
        .selectAll("g.interest, g.hubRoot")
        .on("click",jQuery.proxy(function(e){
            //
            console.log(e);
            var i={};
            if(!e.interests){
                i['interests']=this.root[0].interests;
                i['id']=this.root[0].id;
                i['name']=this.root[0].name;
            }
            else{
                i['interests']= e.interests;
                i['id']= e.id;
                i['name']= e.name;
            }
            this.root = [{
                "isVizRoot":true,
                "id": 9999,
                'name': i.name,
                'type':'interest',
                'r': 45,
                'color': '#D3D3D3',
                'interests' : i.interests
            }];
            this.hubModel = {
                id: 9999,
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
            this.setInterestEventHandler();
        },this));
    }, this), MC.hub().getDuration());
};