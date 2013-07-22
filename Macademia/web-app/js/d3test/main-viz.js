/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/19/13
 * Time: 2:50 PM
 * To change this template use File | Settings | File Templates.
 */
var MC = (window.MC = (window.MC || {}));
//window.History = {options: {html4Mode: true} };

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

    macademia.history.onUpdate(jQuery.proxy(this.onLoad,this));
    this.setEventHandlers();


};

MC.MainViz.prototype.setEventHandlers = function(){
    this.setInterestEventHandler();
    this.setPeopleEventHandler();
};
MC.MainViz.prototype.createModel = function(root){
    var model  = {
        id: root[0].id,
        cx:375,
        cy:425,
        hubRoot : this.root,
        children : this.root[0].interests,
        color: 'hsl(0, 0, 82.7)',
        distance: 100
    };
    return model;
};
MC.MainViz.prototype.onLoad = function(){

    if(macademia.history.get("navFunction")=="interest"){

        this.root = [{
            "isVizRoot":true,
            "id": macademia.history.get("interestId"),
            'name': macademia.history.get("name"),
            'type':'interest',
            'r': 45,
            'color': '#D3D3D3',
            'interests' : this.root[0].interests
        }];
        var hubModel = this.createModel(this.root);



    }
    else if(macademia.history.get("navFunction")=="person"){
        this.root = [{
            "isVizRoot":true,
            "id": macademia.history.get("personId"),
            'name': macademia.history.get("name"),
            'type':'person',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'cleanedRelevance': this.root[0].cleanedRelevance,
            'interestColors': this.root[0].interestColors,
            'r': 45,
            'color': '#D3D3D3',
            'interests' : this.root[0].interests
        }];

        var hubModel = this.createModel(this.root);


    }
    this.svg.select("g.viz").remove();
    this.viz = new MC.InterestViz({
        hubModel: hubModel,
        hubs: this.hubs,
        root: this.root,
        people: this.people,
        circles: this.circles,
        svg : this.svg,
        colors : this.colors
    });
    this.setEventHandlers();
};
MC.MainViz.prototype.setInterestEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {
        this.svg
            .selectAll("g.interest, g.hubRoot")
            .on("click",function(e){
                var targetMap = {
                    "nodeId":"i_"+ e.id,
                    "interestId": e.id,
                    "navFunction":"interest",
                    "name": e.name
                };
                var types = ['searchBox','interestId','personId','requestId'];
                for(var i=0;i<types.length;i++){
                    delete temp[types[i]];
                }
                for(var key in targetMap){
                    MH.setTempValue(key,targetMap[key]);
                }
                macademia.history.update();
//                d3.select(this);
            });
    }, this), MC.hub().getDuration());
};
MC.MainViz.prototype.setPeopleEventHandler = function(){
    window.setTimeout( function() {
        this.svg
            .selectAll("g.person")
            .on("click",jQuery.proxy(function(e){
                var targetMap = {
                    "nodeId":"p_"+ e.id,
                    "personId": e.id,
                    "navFunction":"person",
                    "name": e.name
                };
                var types = ['searchBox','interestId','personId','requestId'];
                for(var i=0;i<types.length;i++){
                    delete temp[types[i]];
                }
                for(var key in targetMap){
                    MH.setTempValue(key,targetMap[key]);
                }
                macademia.history.update();
            },this));
    }, MC.hub().getDuration());
};
MC.MainViz.prototype.transitionRoot = function(){
    //Move root to center

};

