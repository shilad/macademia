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
        svg : this.svg
    });

    this.setInterestEventHandler();
};

MC.MainViz.prototype.setInterestEventHandler = function(){
    this.svg
        .selectAll("g.interest")
        .on("click",jQuery.proxy(function(e){
            //
            this.root = [{
                "isVizRoot":true,
                "id": e.id,
                'name': e.name,
                'type':'interest',
                'r': 45,
                'color': '#D3D3D3',     //get color from hub
                'interests': [
                    {"id": 3, "name": "Online Communities","r":18, "color":0.7},
                    {"id": 6, "name": "web2.0", "r":18, "color":0.7},
                    {"id": 1, "name": "Machine Learning", "r":18},
                    {"id": 4, "name": "Jazz","r":18, "color": 0.3},
                    {"id": 5, "name": "Statistics", "r":18, "color": 0.9},
                    {"id": 2, "name": "Data Mining","r":18}
                ]
            }];
            this.hubModel = {
                id: e.id,
                cx:375,
                cy:425,
                hubRoot : this.root,
                children : this.root[0].interests,
                color: 'hsl(0, 0, 82.7)',
                distance: 100
            };
            this.svg.select("g.viz").remove();
            this.viz = new MC.InterestViz({
                hubModel: this.hubModel,
                hubs: this.hubs,
                root: this.root,
                people: this.people,
                circles: this.circles,
                svg : this.svg
            });
            this.setInterestEventHandler();
        },this));
};