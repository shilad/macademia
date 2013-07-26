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
    this.interests = params.interests;
    this.colors = params.colors;


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

        this.root = {
            "isVizRoot":true,
            "id": macademia.history.get("interestId"),
            'name': macademia.history.get("name"),
            'type':'interest',
            'children' : [96,97,98,99]
        };
//        var hubModel = this.createModel(this.root);
    }
    else if(macademia.history.get("navFunction")=="person"){
        this.root = {
            "isVizRoot":true,
            "id": macademia.history.get("personId"),
            'name': macademia.history.get("name"),
            'type':'person',
            'pic' : '/Macademia/all/image/randomFake?foo',
            'relevance': this.people[macademia.history.get("personId")].relevance,
            'children' : [96,97,98,99]
        };

//        var hubModel = this.createModel(this.root);
    }
    if(this.tRoot){
        this.transitionRoot();
        window.setTimeout(jQuery.proxy(function(){
            this.svg.select("g.viz").remove();
            this.createViz();
            this.setEventHandlers();
        },this),2500);
    }
    else{
        this.svg.select("g.viz").remove();
        this.createViz();
        this.setEventHandlers();
    }
};

MC.MainViz.prototype.createViz = function(){
    this.viz = new MC.InterestViz({
        hubs: this.hubs,
        root: this.root,
        people: this.people,
        circles: this.circles,
        svg : this.svg,
        colors : this.colors,
        interests:this.interests
    });
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

                MC.MainViz.prototype.setTransitionRoot(d3.select(this));

                macademia.history.update();

            });
    }, this), 2504);
};

MC.MainViz.prototype.setPeopleEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {
        this.svg
            .selectAll("g.person")
            .on("click",function(e){
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

                MC.MainViz.prototype.setTransitionRoot(d3.select(this));

                macademia.history.update();
            });
    },this), 2504);
};

MC.MainViz.prototype.setTransitionRoot = function(d3Root){
    this.tRoot=d3Root;
    d3Root
        .attr("class","nextRoot");
};

MC.MainViz.prototype.transitionRoot = function(){
    //TODO: Check out the code on the buttom of person.gsp, we can ask the template to redraw the data
    //Move root to center
    if(this.tRoot){
        var newRoot=this.svg.select('g.nextRoot');
        var oldRoot=this.svg.select('g.vizRoot');
        this.svg
            .select('g.nextRoot')
            .attr('class','g.interest'); //Doesn't matter if it is a person or interest or hub
        this.tRoot
            .transition()
            .duration(1000)
            .attr("transform",function(){
                return oldRoot.attr('transform');
            });
        this.tRoot
            .selectAll('circle')
            .transition()
            .duration(1000)
            .attr("transform",function(){
                if(d3.select(this))
                return "scale(2)";
            });
        this.tRoot
            .select('text')
            .transition()
            .duration(1000)
            .attr("y",function(){
                return 42;
            });
        this.svg
            .select('g.vizRoot')
            .transition()
            .duration(1000)
            .style('opacity',0);
        this.svg
            .selectAll('g.interest, g.hubRoot, g.person')
            .transition()
            .delay(1500)
            .duration(1000)
            .style('opacity',function(){
                if(d3.select(this) === newRoot){
                    return 1.0;
                }else{
                    return 0.0;
                }
            });
    }
};




