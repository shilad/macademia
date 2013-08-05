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
    this.transitionReady=false;
    this.colors =[ //giving the colors used on the page to color hubs
        "#f2b06e",
        "#f5a3d6",
        "#b2a3f5",
        "#a8c4e5",
        "#b4f5a3"
    ];

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

MC.MainViz.prototype.refreshViz = function(){
    var self = this;
    var doNothing = function(timeout){
        window.setTimeout(function(){
            return false;
                },timeout);
    };
    while(!this.transitionReady){
        console.log('inside while');
        doNothing(500);
    }
    if(self.tRoot){ //If we are on transition
        self.svg.select("g.viz").remove();
        self.createViz();
        self.setEventHandlers();
        self.transitionReady=false;
    }
    else{
        self.svg.select("g.viz").remove();
        self.createViz();
        self.setEventHandlers();
        self.transitionReady=false;
    }
};

MC.MainViz.prototype.onLoad = function(){
    var rootId = macademia.history.get("nodeId").substring(2);
    var rootClass = macademia.history.get("navFunction");
    var url = macademia.makeActionUrlWithGroup('all', 'd3', rootClass + 'Data') + '/' + rootId;
    var self = this;
    if(self.tRoot){
        self.transitionRoot(); //transition the root before running ajax
    }


    $.ajax({ //get the data from the model encoded in JSON
        url:url,
        dataType:'json',
        success: function(json){
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

            //building root
            //We limit the number of child of the vizRoot by limiting amount of children coming from each cluster
            //TODO:decide whether to limit the amount of the children for the root on the controller end.
            var limitedChildren=[];
            if (rootClass == 'person'){
                var childrenCounts={};
                var curInterest;
                var rootChildren = peeps[rootId].interests; //all children of the root
                for(var i = 0; i < rootChildren.length; i++){ //loop through all children
                    var childId = rootChildren[i];
                    var clusterId = interests[childId].cluster;
                    curInterest = interests[childId];
                    if(childrenCounts[clusterId]){
                        //balancing the number of children from each cluster
                        var limit = Math.floor(self.hubChildrenLimit/Object.keys(clusterMap).length);
                        if(childrenCounts[clusterId] < limit){
                            limitedChildren.push(curInterest.id);
                            childrenCounts[clusterId]++;
                        }
                    }
                    else{
                        limitedChildren.push(curInterest.id); //pushing in the first children
                        childrenCounts[curInterest.cluster]=1;
                    }
                }
                var root = {type:'person', id:rootId, children: limitedChildren};
            } else if (rootClass == 'interest') {
                var root = {type:'interest', id:rootId, children: clusterMap[rootId]};
            }

            if(self.tRoot && rootClass=='interest'){ //taking care of the color of the interest vizRoot
                root['color']=self.tRoot.select('.interestOuter').attr('fill');
            }

            //building relatednessMap and parse interests (changing string id from JSON into number id)
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
                    } else { //don't exist, create a new array
                        value = Number(key);
                        relatednessMap[clusterId]=[value];
                    }
                }
                //parse the interest id, we need number
                interests[key].id = Number(interests[key].id);    //Necessary??
            }

            //building people while keeping a limit on the total number of people on a page
            //TODO:decide whether to limit the amount of people on the controller end.
            var limitedPeople = {};
            var sortedPeopleIDs = [];
            for(var id in peeps){
                sortedPeopleIDs.push(id);
            }
            sortedPeopleIDs.sort(function(a,b){ //sort by overall relevance to the hub
                return peeps[b].relevance['overall']-peeps[a].relevance['overall'];
            })

            for(var i = 0; i < self.peopleLimit; i++){
                var id = sortedPeopleIDs[i]
                limitedPeople[id]=peeps[id];
            }

            //Setting global variable based on data from JSON
            self.hubs = hubs;
            self.people = limitedPeople;
            self.root = root;
            self.interests = interests;
            self.relatednessMap = relatednessMap;
            self.transitionReady = true;

            if(!self.tRoot){
                self.svg.select("g.viz").remove();
                self.createViz();
                self.setEventHandlers();
                self.transitionReady=false;
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
    //TODO: Check out the code on the bottom of person.gsp, we can ask the template to redraw the data (may not be possible)
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
            })
            .each('end',jQuery.proxy(this.refreshViz(),this));
    }
};





