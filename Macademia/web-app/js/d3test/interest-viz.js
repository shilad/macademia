/**
 * Created with IntelliJ IDEA.
 * User: jesse
 * Date: 7/16/13
 * Time: 1:25 PM
 * To change this template use File | Settings | File Templates.
 */

var MC = (window.MC = (window.MC || {}));

/**
 *
 * Creates a layout integrating interest.js, person.js, and hubs.js into one visualization.
 *
 * An interest-viz is a constructor needing the following params:
 * hubs, root, interests, people, circles, svg, and colors
 *
 * Example usage:
 *
 var interests = {
        3: {"id": 3, "name": "Senegal"},
        6: {"id": 6, "name": "UofL"},
        2: {"id": 2, "name": "Warm weather"},
        1: {"id": 1, "name": "his parents"},
        4: {"id": 4, "name": "Makeing Patino Smile"},
        5: {"id": 5, "name": "Timberwolves"},
        2: {"id": 2, "name": "NBA"},
        10: {"id": 10, "name": "Siva"},
        11: {"id": 11, "name": "Behanan"},
        12: {"id": 12, "name": "Steven Van Treesee"},
        13: {"id": 13, "name": "Rusdiculous"},
        14: {"id": 14, "name": "Chris Smith"},
        15: {"id": 15, "name": "Luke"},
        31: {"id": 31, "name": "Basketball"},
        22: {"id": 22, "name": "Soccer"},

    };
 var peeps = {
        15830: {"id":15830,
            "name":"Gorgui Dieng",
            "pic":"/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
            "relevance":{
                "11":1.77,
                "overall":1.0769508928060532},
            "interests":[
                11,
                22]},
        }
 };

 var colors =[
 "#b2a3f5",
 ];

 var root = {type : 'person', id: 7, children : [3,6,1,4,5,2]};

 var hubs = [
 {type : 'interest', id : 11, children : [12,14,15,16]},
 ];

 var svg = d3.select('svg').attr('width', 1000).attr('height', 1000);

 var viz = new MC.InterestViz({
      hubs: hubs,
      root: root,
      interests: interests,
      people: peeps,
      circles: gradientCircles,
      svg : svg,
      colors: colors
    });
 *
 */


MC.InterestViz = function(params) {
    this.positions = [
        [], // 1 hub case
        [], // 2 hub case
        [{x:0.5,y:0.55},{x:0.25,y:0.85},{x:0.75,y:0.85},{x:0.5,y:0.2}], // 3 hub case (root, hub1, hub2, hub3)
        [] // 4 hub case
    ];

    this.hubs = params.hubs;
    this.people = params.people;
    this.root = params.root;
    this.svg = params.svg;

    // .. = .. || default_value
    this.inactiveOpacity =  params.inactiveOpacity || 0.2;
    this.activeOpacity = params.activeOpacity || 1;
    this.inactiveColor = params.inactiveColor || '#C0C0C0';
    this.activeColor = params.activeColor || 'black';

//    this.circles = params.circles;
    this.interests = params.interests;
    this.colors = params.colors;
    this.container=this.svg.append("g").attr("class","viz").attr("width",800).attr("height",600);
    // construct the hubModel here based on other parameters
    this.currentColors = [];

    this.svgWidth = this.container.attr("width"); //container provides a padding
    this.svgHeight = this.container.attr("height"); //container provides a padding
    this.distance = 80;
    this.relatednessMap = params.relatednessMap;


    this.gCircle = [this.hubs.length]; //same number as the hubs

    this.calculateColors();
    this.postionHubsGradientCirlces();
    this.setRadii(30,12);

    this.setGradients();
    this.drawGradientCircles();
    this.createInterestViz();
    this.startPeople();
};

// Position the hubs and their gradient circles around the visRoot
MC.InterestViz.prototype.postionHubsGradientCirlces = function(){
    var n = this.hubs.length;
    var coordinates = this.positions[n-1];
    var posRoot = coordinates[0];

    //Setting the root
    this.root.cx = this.svgWidth * posRoot.x;
    this.root.cy = this.svgHeight * posRoot.y;

    //Setting the hubs
    for(var i=0;i<this.hubs.length;i++){
        var pos = coordinates[i+1]; //start with 1 because 0 is root
        this.hubs[i].cx = this.svgWidth * pos.x;
        this.hubs[i].cy = this.svgHeight * pos.y;
//        console.log(this.hubs[i]);
    }

    // applying the padding
    var dist = this.distance; //use the distance between the root and child as padding
    var scale = 1.5;
    var padL = dist * scale; //left
    var padR = this.svgWidth - dist * scale; //right
    var padT = dist * scale; //top
    var padB = this.svgHeight - dist * scale; //bottom

    for(var i=0; i<n; i++){

        //Left
        if(this.hubs[i].cx < padL){
            this.hubs[i].cx = padL;
        }

        //Right
        if(this.hubs[i].cx > padR){
            this.hubs[i].cx = padR;
        }

        //Top
        if(this.hubs[i].cy < padT){
            this.hubs[i].cy = padT;
        }

        //Bottom
        if(this.hubs[i].cy > padB){
            this.hubs[i].cy = padB;
        }

    }

    //Setting the gradient circles
    var circle = {};
    circle['cx'] = this.root.cx;
    circle['cy'] = this.root.cy;
    circle['id'] = this.root.id;
    circle['color'] = this.root.color;
    circle['stop-opacity'] = .3;
    this.gCircle[0] = circle;

    for (var i=0; i<n; i++){
        var circle = {};
        circle['cx'] = this.hubs[i].cx;
        circle['cy'] = this.hubs[i].cy;
        circle['id'] = this.hubs[i].id;
        circle['color'] = this.hubs[i].color;
        circle['stop-opacity'] = .3;
        this.gCircle[i+1] = circle;
    }

    //console.log(this.gCircle);


}

MC.InterestViz.prototype.setRadii = function(hubRadius,interestRadius) {
    for(var i in this.interests){
        this.interests[i]['r']=interestRadius;
//        console.log(this.interests[i].r);
    }
    for(var i = 0; i < this.hubs.length; i++){
        this.hubs[i]['r']=hubRadius;
//        console.log(this.hubs[i]);
    }
    this.root['r']=hubRadius;

    for(var i=0; i < this.gCircle.length; i++){
        this.gCircle[i]['r'] = this.svgWidth * 0.3;
    }
//    this.svg
//        .selectAll('g.interest')
//        .attr('r',interestRadius);
//    this.svg
//        .selectAll('g.hubRoot')
//        .attr('r',hubRadius);
};

MC.InterestViz.prototype.calculateColors = function() {
    // assign interest colors to hubs
    var interestColors = {};
    if (this.root.color) {
        this.currentColors.push(this.root.color);
    } else {
        this.root.color = this.makeColorful();
    }

    interestColors[this.root.id] = this.root.color;
    for (var i = 0; i < this.hubs.length; i++) {
        this.hubs[i].color = this.makeColorful();
        interestColors[this.hubs[i].id] = this.hubs[i].color;
    }

    // assign interest colors to people
    for (var pid in this.people) {
        this.people[pid].interestColors = interestColors;
    }
};

MC.InterestViz.prototype.startPeople = function() {

    window.setTimeout( jQuery.proxy(function() {
//        this.createInterestColors();
        this.createPersonView();
        this.createPeople();
        this.createPersonLayoutView()
        this.createPersonLayout();


    }, this), 2503);

};

//Position the hubs and the root
MC.InterestViz.prototype.createInterestViz = function() {
    this.createHub(this.root);
    for(var i = 0; i < this.hubs.length; i++) {
        this.createHub(this.hubs[i],i);
    }
};

MC.InterestViz.prototype.createInterestColors = function(){
    var interestColors ={};

    for(var i = 0; i < this.people.length; i++){
        for(var j = 0; j< this.people[i].interests.length; j++){
            for(var k = 0; k< this.hubs.length; k++){
                for(var l =0; l< this.hubs[k][0].interests.length;l++){

                    if(this.people[i].interests[j] == this.hubs[i][0].interests[j].id){
                        interestColors[this.people[i].interests[j]] = this.hubs[i][0].color; //creates a map with interest id and color assigned to that id
                    }

//            if(this.hubs[i][0].interests)
//            if{this.hubs[i][0]==}
//            interestColors[this.people[i].interests[j]] = this.hubs[i][0].color; //creates a map with interest id and color assigned to that id
                };
            };
        };
    };

};

MC.InterestViz.prototype.createHub = function(model,j) {
    var calculatedDelay=(j+1)*500;
    var hubInterests = [];
    for (var i = 0; i < model.children.length; i++) {
        var childId = model.children[i];
        hubInterests.push(this.interests[childId]);
    }
    var rootModel = model.type == 'person' ? this.people[model.id] : this.interests[model.id];
    rootModel.type = model.type;
    rootModel.r=model.r;
//    console.log(hubInterests);
    this.container
        .datum({
            id : model.id,
            children : hubInterests,
            root : rootModel,
            color : model.color,
            isVizRoot : (model == this.root),
            cx : model.cx,
            cy : model.cy,
            distance : 100,
            delay : calculatedDelay,
            distance : this.distance,
            relatednessMap: this.relatednessMap
        })
        .call(MC.hub());

};

MC.InterestViz.prototype.drawGradientCircles = function(){
    this.container.selectAll('circle.gradient')
        .data(this.gCircle)
        .enter()
        .append("circle")
        .attr('fill', function(d) {
            return 'url(#gradient_' + d.id + ')';
        })
        .attr('cx', function(d) {
            return d.cx;
        })
        .attr('cy', function(d) {
            return d.cy;
        })
        .attr('r', function(d) {
            return d.r;
        })
        .attr("class","gradient");
};


MC.InterestViz.prototype.setGradients = function(){
    var defs = this.container
        .selectAll("defs")
        .data(this.container[0])
        .enter()
        .append('defs');

    var rGs = defs
        .selectAll("radialGradient")
        .data(this.gCircle)
        .enter()
        .append('radialGradient')
        .attr("id",function(d){
            return "gradient_"+ d.id;
        });
    rGs
        .append("stop")
        .attr("offset","20%")
        .attr("style",function(d){
            return "stop-color:"+d.color+";stop-opacity:"+ d['stop-opacity']+";";
        });
    rGs
        .append("stop")
        .attr("offset","100%")
        .attr("style",function(d){
            return "stop-color:"+d.color+";stop-opacity:0;";
        });


};

/*
 * Methods for the people heads are below here-----
 */


MC.InterestViz.prototype.getD3Interests = function() {
    return this.container.selectAll('g.interest,g.hubRoot,g.vizRoot');
};

//return a person view
MC.InterestViz.prototype.createPersonView = function() {
    this.personView = MC.person();
    return this.personView;
};

//Creates the floating people heads
MC.InterestViz.prototype.createPeople = function() {
    var people_array = [];
    for (var key in this.people) {
        if(this.root.id != key){//check the root
            people_array.push(this.people[key]);
//            console.log(this.people[key]);
        }
    }
    this.container
        .datum(people_array)
        .call(this.personView);
};

//Grabs all the people in svg
MC.InterestViz.prototype.getD3People = function() {
    return this.container.selectAll('g.person');
};

//Sets the locations of the person heads
MC.InterestViz.prototype.createPersonLayoutView = function(){
    this.personLayoutView = MC.personLayout()
        .setPeopleNodes(this.getD3People())
        .setClusterMap(this.createClusterMap())
        .setInterestNodes(this.getD3Interests());
    return this.personLayoutView;
};

MC.InterestViz.prototype.createPersonLayout = function(){
    this.container
        .selectAll('person-layouts')
        .data([0])
        .enter()
        .call(this.personLayoutView);
};

MC.InterestViz.prototype.stopPersonLayout = function(){
    this.personLayoutView.stop();
};
MC.InterestViz.prototype.createClusterMap = function(){
    var clusterMap = {};
    clusterMap[this.root.id] = this.root.children;
    for(var i = 0; i < this.hubs.length; i++){
        clusterMap[this.hubs[i].id] = this.hubs[i].children;
    };

    return clusterMap;
};
//I could not think of a better name it sets both the hub and interest colors from the color scheme
MC.InterestViz.prototype.makeColorful = function(){
    var color;
    //the colors already on the page

    for(var i = 0; i < this.colors.length; i++){
        if(this.currentColors.indexOf(this.colors[i])<0){
            color=this.colors[i];
            this.currentColors.push(color);
            return color;
        };

    };
};

//Grabs all the people in svg
MC.InterestViz.prototype.getPeoplesInterests = function(d) {
    var interestNameList=" ";
    for(var i=0; i< this.people[d.id].interests.length;i++){
        if(i < this.people[d.id].interests.length-1){
            interestNameList+= " "+this.interests[this.people[d.id].interests[i]].name + ",";
        }
        else
            interestNameList+= " "+this.interests[this.people[d.id].interests[i]].name ;

    }

    return interestNameList;
};

MC.InterestViz.prototype.toolTipHover = function(e,pos){

    var div = d3.select('#tooltipBox');
    var people = this.people;
    var id =0;  //stores d's id
    var type;  //stores d's type or empty string if no type
    //prevents repetitive displaying of mouse over when mouse is moved over a single element


    if(e.id) {   //for non-hub people and interests
        id= e.id;
        type ="";   //do not have type
    }
    else { //deals with hubNodes person and interest
        id= e[0].id;
        type=e[0].type;
    }
    if(id in people && e.interests ||  type == "person" ){ //checks to see if it is a person
        jQuery.get('http://localhost:8080/Macademia/all/person/tooltip/' + id, function(data) {
            jQuery('#tooltipBox').html(data);
//            console.log(jQuery('#tooltipBox'));
        });}
    else {    //deals with interests
        jQuery.get('http://localhost:8080/Macademia/all/interest/tooltip/' + id, function(data) {
            jQuery('#tooltipBox').html(data);
        });
    }

    div
        .transition()
        .duration(500)
        .style("display", "block")
        .style('left',pos.left+100)
        .style('top',pos.top)
        .each('end', function(){
            div.on("mouseover", function() {
                window.setTimeout(function () {
                    div
                        .transition()
                        .style("display", "block");
                })
                    .on("mouseout", function() {
                        div
                            .transition()
                            .style("display", "none");
                    });
            },250);
        });

};

//This function enables highlighting of the nodes when hovers
//TODO: Come up with some mechanism to set and reset attribute such as opacity for highlight and fading
MC.InterestViz.prototype.enableHoverHighlight = function(){
    var div =  d3.select('body')
        .append("div")
        .attr("id","tooltipBox")
        .style("position", "absolute");


    this.hoverVizRoot();
    this.hoverHubRoot();
    this.hoverVizRootChild();
    this.hoverHubRootChild();
    window.setTimeout(jQuery.proxy(function(){
        this.hoverPerson();                       //People aren't created fast enough, this delays the binding of the handler
    },this),2503);

};

MC.InterestViz.prototype.hoverPerson = function(){
    //Highlight the vizRoot, interests around vizRoot and hubRoot, hubRoot(if it is a direct interest?)
    var self = this;

    this.container.selectAll('g.person')
        .on("mouseover", function(e){
            var pos = this.getBoundingClientRect();
            self.toolTipHover(e,pos);
            self.activateHubRootAndChildren(e.id, e.interests, self, true);

            d3.selectAll('g.person')
                .attr('opacity', function(d){
                    if((d.id==e.id)){
                        self.highlightLabel(d3.select(this));
                        return self.activeOpacity;
                    }else {
                        return self.inactiveOpacity;
                    }
                });
        }).on("mouseout", this.mouseOut);
};

MC.InterestViz.prototype.hoverHubRoot = function(){
    //Highlight all the children and persons related to the children or the root itself
    //also highlight the children around the vizRoot that are related to the hubRoot.
    var self =this;
    var relatednessMap = this.relatednessMap;
    d3.selectAll('g.hubRoot')
        .on("mouseover", function(e){
            var hubRootID = e[0].id;
            var hubRootMap = relatednessMap[hubRootID];
            var pos = this.getBoundingClientRect();
            self.toolTipHover(e,pos);
            self.activateHubRootAndChildren(hubRootID, hubRootMap, self, false);
//            d3.select(this).select('g.label').select('text').text(MC.interest().getText());

            d3.selectAll('g.person')
                .attr('opacity',function(d){
                    if((d.relevance && d.relevance[hubRootID] )){
                        self.highlightLabel(d3.select(this));
                        return self.activeOpacity;
                    }
                    else{
                        return self.inactiveOpacity;
                    }
                });

        })
        .on("mouseout", this.mouseOut);
};

MC.InterestViz.prototype.hoverHubRootChild = function(){
    //Highlight the hubRoot and the child itself and people who has the interest
    var self =this;
    var relatednessMap = this.relatednessMap;
    d3.selectAll('g.hub').each(function(d){
        if(d[0].id!=self.root.id){
            d3.select(this)
                .selectAll('g.interest')
                .on("mouseover", function(e){
                    var pos = this.getBoundingClientRect();
                    self.toolTipHover(e,pos);
                    var interestID = e.id;
                    var hubRootID = self.findHubRootID(interestID);
                    var hubRootMap = relatednessMap[hubRootID];
                    self.activateHubRootAndChildren(hubRootID, hubRootMap, self, true);
                    d3.select(this).select('g.label').select('text').text(MC.interest().getText());
                    d3.selectAll('g.person')
                        .attr('opacity',function(d){
                            if((d.interests && d.interests.indexOf(interestID) >= 0)){
                                self.highlightLabel(d3.select(this));
                                return self.activeOpacity;
                            }
                            else{
                                return self.inactiveOpacity;
                            }
                        });

                })
                .on("mouseout", self.mouseOut);
        }
    });


};

MC.InterestViz.prototype.hoverVizRoot = function(){
    var self =this;
    d3.select('g.vizRoot')
        .on("mouseover", function(e){
            var pos = this.getBoundingClientRect();
            self.toolTipHover(e,pos);
            var vizID = d3.select(this).data()[0][0].id;
            d3.selectAll('g.hub, g.person')
                .attr('opacity',function(d){
                    if(d[0]&&d[0].id==vizID){
                        self.highlightLabel(d3.select(this));
                        return self.activeOpacity;
                    }
                    else{
                        return self.inactiveOpacity;
                    }
                });
        })
        .on("mouseout", this.mouseOut);
};

MC.InterestViz.prototype.hoverVizRootChild = function(){
    //Highlight the VizRoot and the child itself and people who has the interest
    var self = this;
    var relatednessMap = this.relatednessMap;
    d3.select('#hub'+this.root.id)
        .selectAll('g.interest')
        .on("mouseover", function(e){
            var pos = this.getBoundingClientRect();
            self.toolTipHover(e,pos);
            var interestID = e.id;
            var hubRootID = self.findHubRootID(interestID);
            var hubRootMap = relatednessMap[hubRootID];
            self.activateHubRootAndChildren(hubRootID, hubRootMap, self, false);
            d3.select(this).select('g.label').select('text').text(MC.interest().getText());
            d3.selectAll('g.person')
                .attr('opacity',function(d){
                    if((d.interests && d.interests.indexOf(interestID) >= 0)){
                        self.highlightLabel(d3.select(this));
                        return self.activeOpacity;
                    }
                    else{
                        return self.inactiveOpacity;
                    }
                });
            self.highlightLabel(d3.select(this));
        })
        .on("mouseout", this.mouseOut);
};

MC.InterestViz.prototype.mouseOut = function(){
    if(d3.select(this).classed('interest')){
        d3.select(this).select('g.label').select('text').text(MC.interest().getCleanedText());
    }
    d3.selectAll('g.hubRoot, g.interest, g.person, g.hub')
        .attr('opacity',this.activeOpacity)
        .selectAll('g.label')
        .attr('fill',this.inactiveColor);
    d3.select('body')
        .select("#tooltipBox")
        .transition()
        .delay(500)
        .duration(500)
        .style("display", "none");
};
MC.InterestViz.prototype.findHubRootID = function(interestID){
    for(var i in this.relatednessMap){
        if(this.relatednessMap[i].indexOf(interestID) >= 0){ //find out which hub it is in the map
            return i;
        }
    }
};
MC.InterestViz.prototype.highlightLabel = function(selector){
    selector
        .selectAll('g.label')
        .attr('fill',this.activeColor);
};
MC.InterestViz.prototype.activateHubRootAndChildren = function(mapID, map, self, childText){      //ChildText should be a bool to say whether or not to color the children's label
    d3.selectAll('g.hubRoot, g.interest')
        .attr('opacity',function(d){
            if((d[0] && mapID == d[0].id )){
                self.highlightLabel(d3.select(this));
                return self.activeOpacity;
            }else if(d['id'] && map.indexOf(d.id) >= 0){
                if(childText){
                    self.highlightLabel(d3.select(this));
                }
                return self.activeOpacity;
            }
            else{
                return self.inactiveOpacity;
            }
        });
};

