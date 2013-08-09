/**
 * Created with IntelliJ IDEA.
 * User: research
 * Date: 8/6/13
 * Time: 3:18 PM
 * To change this template use File | Settings | File Templates.
 */
var MC = (window.MC = (window.MC || {}));

MC.HtmlViz = function(params) {
//    var nodeId = macademia.history.get('nodeId');
//    var rootId = nodeId.substring(2);
//    var rootClass = nodeId.substring(0,1) == "p" ? "person" : "interest";
//    console.log(nodeId + ' ' + rootId + " " + rootClass);
//
//    var url = macademia.makeActionUrlWithGroup('all', 'd3', rootClass + 'Data') + '/' + rootId;
//
//    $.ajax({ //get the data from the model encoded in JSON
//        url:url,
//        dataType:'json',
//        success: function(json){
//            var model = new HtmlVizModel(json);
//            console.log(json);
//            console.log(model);
//            var interests = model.getInterests();
//            var peeps = model.getPeople();
//            var clusterMap = model.getClusterMap();
//            console.log(interests);
//        }
//    });
}

//MC.HtmlViz.prototype.calculateColors = function() {
//    // assign interest colors to hubs
//    var interestColors = {};
//    if (this.root.color) {
//        this.currentColors.push(this.root.color);
//    } else {
//        this.root.color = this.makeColorful();
//    }
//
//    interestColors[this.root.id] = this.root.color;
//    for (var i = 0; i < this.hubs.length; i++) {
//        this.hubs[i].color = this.makeColorful();
//        interestColors[this.hubs[i].id] = this.hubs[i].color;
//    }
//
//    // assign interest colors to people
//    for (var pid in this.people) {
//        this.people[pid].interestColors = interestColors;
//    }
//};

//MC.HtmlViz.prototype.makeColorful = function(){
//    var color;
//    //the colors already on the page
//
//    for(var i = 0; i < this.colors.length; i++){
//        if(this.currentColors.indexOf(this.colors[i])<0){
//            color=this.colors[i];
//            this.currentColors.push(color);
//            return color;
//        };
//
//    };
//};