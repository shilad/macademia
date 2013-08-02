/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/19/13
 * Time: 2:50 PM
 * To change this template use File | Settings | File Templates.
 */
var MC = (window.MC = (window.MC || {}));

MC.MainViz = function(params) {
//    this.hubs = params.hubs;
//    this.people = params.people;
//    this.root = params.root;
//    this.svg = params.svg;
//    this.circles = params.circles;
//    this.interests = params.interests;
//    this.colors = params.colors;
//    this.relatednessMap = params.relatednessMap;

//    console.log(params);
    this.peopleLimit =  macademia.history.get('navFunction')=='person' ? 15 : 14;
    this.hubChildrenLimit = 10;
    this.svg = d3.select('svg').attr('width', 1024).attr('height', 768);
    macademia.history.onUpdate(jQuery.proxy(this.onLoad,this));
    this.setEventHandlers();


};

MC.MainViz.prototype.setEventHandlers = function(){
    this.setInterestEventHandler();
    this.setPeopleEventHandler();
    if(this.viz){
        this.viz.enableHoverHighlight();
    }
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
//    if(macademia.history.get("navFunction")=="interest"){
//        this.root = {
//            "isVizRoot":true,
//            "id": macademia.history.get("interestId"),
//            'name': macademia.history.get("name"),
//            'type':'interest',
//            'children' : [96,97,98,99,9]
//        };
////        var hubModel = this.createModel(this.root);
//    }
//    else if(macademia.history.get("navFunction")=="person"){
////        console.log(this.people[macademia.history.get("personId")]);
//        this.root = {
//            "isVizRoot":true,
//            "id": macademia.history.get("personId"),
//            'name': macademia.history.get("name"),
//            'type':'person',
//            'pic' : '/Macademia/all/image/randomFake?foo',
//            'relevance': this.people[macademia.history.get("personId")].relevance,
//            'children' : this.people[macademia.history.get("personId")].interests
//        };
//
////        var hubModel = this.createModel(this.root);
//    }

    var rootId = macademia.history.get("nodeId").substring(2);
    var rootClass = macademia.history.get("navFunction");
    var url = macademia.makeActionUrlWithGroup('all', 'd3', rootClass + 'Data') + '/' + rootId;
    var self = this;
//    url: url,
//        dataType : 'json',
//        success : function (json) { self.loadJson(new VizModel(json)); }
    if(self.tRoot){
        self.transitionRoot(); //transition the root before running ajax
    }
    $.ajax({
        url:url,
        dataType:'json',
        success: function(json){ //this is d3 ajax
            var model = new VizModel(json);
            //notice that interests has relatedQueryId that
            //tell us which cluster it belongs to
            var interests = model.getInterests();
            var peeps = model.getPeople();
            var clusterMap = model.getClusterMap();

            //building hubs
            var hubs = [];
            for (var key in clusterMap){
                if(rootId != key)
                    hubs.push({type:'interest', id:Number(key), children:clusterMap[key]});
            }

            var clusters={};
            var curInterest;
            //building root
            if (rootClass == 'person'){
                //We limit the number of child of the vizRoot
                var limitedChildren=[];
                for(var i = 0; i < peeps[rootId].interests.length; i++){
                    curInterest = interests[peeps[rootId].interests[i]];
                    if(clusters[curInterest.cluster]){
                        if(clusters[curInterest.cluster]<(Math.floor(self.hubChildrenLimit/Object.keys(clusterMap).length))){
                            limitedChildren.push(curInterest.id);
                            clusters[curInterest.cluster]++;
                        }
                    }
                    else{
                        limitedChildren.push(curInterest.id);
                        clusters[curInterest.cluster]=1;
                    }
                }
                var root = {type:'person', id:rootId, children: limitedChildren};
            } else if (rootClass == 'interest') {
                var root = {type:'interest', id:rootId, children: clusterMap[rootId]};
            }
            if(self.tRoot&&rootClass=='interest'){
                console.log(self.tRoot.select('.interestOuter').attr('fill'));
                root['color']=self.tRoot.select('.interestOuter').attr('fill');
            }


            //building relatednessMap and parse interests
            var relatednessMap = {};
            var value;
            var interest;
            var clusterId;
            for(var key in interests){
                interest = interests[key];
                clusterId = interest.cluster;
                if(clusterId != -1){
                    if(relatednessMap[clusterId]){
                        relatednessMap[clusterId].push(Number(key));
                    } else {
                        value = Number(key);
                        relatednessMap[clusterId]=[value];
                    }
                }
                //parse the interest id, we need number
                interests[key].id = Number(interests[key].id);    //Necessary??
            }

            var limitedPeople = {};
            var sortedPeopleIDs = [];
            for(var id in peeps){
                sortedPeopleIDs.push(id);
            }
            sortedPeopleIDs.sort(function(a,b){
                return peeps[b].relevance['overall']-peeps[a].relevance['overall'];
            })

            for(var i = 0; i < self.peopleLimit; i++){
                limitedPeople[sortedPeopleIDs[i]]=peeps[sortedPeopleIDs[i]];
            }

            var colors =[
                "#f2b06e",
                "#f5a3d6",
                "#b2a3f5",
                "#a8c4e5",
                "#b4f5a3"
            ];

            self.hubs = hubs;
            self.people = limitedPeople;
//            self.people = peeps;
            self.root = root;
            self.interests = interests;
            self.colors = colors;
            self.relatednessMap = relatednessMap;

            if(self.tRoot){
//                self.transitionRoot();
                window.setTimeout(function(){
                self.svg.select("g.viz").remove();
                self.createViz();
                self.setEventHandlers();
                },2500);
            }
            else{
                self.svg.select("g.viz").remove();
                self.createViz();
                self.setEventHandlers();
            }
        }

    });

};

MC.MainViz.prototype.createViz = function(){
    this.viz = new MC.InterestViz({
        hubs: this.hubs,
        root: this.root,
        people: this.people,
        circles: this.circles,
        svg : this.svg,
        colors : this.colors,
        interests:this.interests,
        relatednessMap: this.relatednessMap
    });
};

MC.MainViz.prototype.setInterestEventHandler = function(){
    window.setTimeout( jQuery.proxy(function() {
        this.svg
            .selectAll("g.interest, g.hubRoot")
            .on("click",function(e){
                var targetMap;
                if(e[0]){
                    targetMap = {
                        "nodeId":"i_"+ e[0].id,
                        "interestId": e[0].id,
                        "navFunction":"interest",
                        "name": e[0].name
                    };
                }else{
                    targetMap = {
                        "nodeId":"i_"+ e.id,
                        "interestId": e.id,
                        "navFunction":"interest",
                        "name": e.name
                    };
                }

                var types = ['searchBox','interestId','personId','requestId'];
                for(var i=0;i<types.length;i++){
                    delete temp[types[i]];
                }
                for(var key in targetMap){
                    MH.setTempValue(key,targetMap[key]);
                }

                MC.MainViz.prototype.setTransitionRoot(d3.select(this),'interest');

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

                MC.MainViz.prototype.setTransitionRoot(d3.select(this),'person');

                macademia.history.update();
            });
    },this), 2504);
};

MC.MainViz.prototype.setTransitionRoot = function(d3Root,type){
    this.tRoot=d3Root;
    d3Root
        .attr("class","nextRoot "+type);
};

MC.MainViz.prototype.transitionRoot = function(){
    //TODO: Check out the code on the bottom of person.gsp, we can ask the template to redraw the data
    //Move root to center
    if(this.tRoot){
//        var newRoot = this.svg.select('g.nextRoot');
//        var data = newRoot.data();
//        var people = [{
//            'id' : data.id,
//            'name' : data.name,
//            'pic' : data.pic,
//            'relevance': data.relevance,
//            'cx' : 0,
//            'cy' : 0,
//            'interestColors': data.interestColors
//        }];
//
//        d3.select('svg').datum(people).call(MC.person());

        var newRoot=this.svg.select('g.nextRoot.interest');
        var oldRoot=this.svg.select('g.vizRoot');
        this.viz.stopPersonLayout();
        this.svg
            .select('g.nextRoot')
            .attr('class','g.interest'); //Doesn't matter if it is a person or interest or hub
        this.tRoot
            .transition()
            .duration(1000)
            .attr("transform",function(){
                return oldRoot.attr('transform');
            });
        if(newRoot[0][0]==null){ //checks to see if it is a person; if so, then the transition changes
            newRoot=this.svg.select('g.nextRoot.person');
            this.tRoot
                .selectAll('g.pie')
                .transition()
                .duration(1000)
                .attr("transform",function(){
                    if(d3.select(this))
                        return "scale(1.5)";
                });
            this.tRoot
                .selectAll('image')
                .transition()
                .duration(1000)
                .attr("transform",function(){
                    if(d3.select(this))
                        return "translate("+-14*1.5+", "+-21*1.5+")scale(1.5)";
                });
            this.tRoot
                .select('text')
                .transition()
                .duration(1000)
                .attr("y",function(){
                    return 48;
                });
        }
        else{
            if(!this.tRoot.data()[0][0]){    //this.tRoot.data()[0][0].r) should equal 30 if it is a hubroot
                this.tRoot
                    .selectAll('circle.interestOuter')
                    .transition()
                    .duration(1000)
                    .attr("transform",function(){
                        if(d3.select(this))
                            return "scale("+(20/12)+")";
                    });
                this.tRoot
                    .select('circle.interestInner')
                    .transition()
                    .duration(1000)
                    .attr("r",function(){
                        if(d3.select(this))
                            return d3.select(this).attr('r')*(20/12);
                    });
                this.tRoot
                    .select('text')
                    .transition()
                    .duration(1000)
                    .attr("y",function(){
                        return 42;
                    });
            }
        }

        this.svg
            .select('g.vizRoot')
            .transition()
            .duration(1000)
            .style('opacity',0);
        this.svg
            .selectAll('g.interest, g.hubRoot, g.person, g.connectionPaths')
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





