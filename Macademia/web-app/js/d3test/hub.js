/**
 * Created with IntelliJ IDEA.
 * User: research
 * Date: 7/16/13
 * Time: 10:41 AM
 * To change this template use File | Settings | File Templates.
 *
 * Creates a hub object.  A hub consists of a type (interest or person), id, and an array of its children.
 *
 * Example usage:
 *
 * var hubs = [
 * {type : 'interest', id : 11, children : [12,14,15,16]},
 * {type : 'interest', id : 13, children : [21,22,23,24,25,26]},
 * {type : 'interest', id : 33, children : [23,43,53,63]}
 * ];
 *
 * var hub = MC.hub()
 *      .setName("Data Mining");
 *
 * Available attributes:
 *      id: the identification number
 *      cx: center x position
 *      cy: center y position
 *      r: radius of hub
 *      duration: ?
 *      cssClass: class for <g> enclosing the label
 *      regularFill: I don't think we use this anymore...
 *      highlightedFill: I don't think we use this...
 *      selectHub: used when a hub is selected by making it regular filled
 *      deselectHub: used when a hub is not selected by making it highlighted filled
 *
 * @return {Function}
 */


var MC =  (window.MC = (window.MC || {}));

MC.hub = function() {
    function hub(selection) {
        selection.each(function(data) {
            //The following code draws interests based on data

            //Getting basic info
            var root  = data.root;

            var color = 0.5; //default color for children
            if(data['color']){
                color = data['color'];
//                console.log(data['color']);
            }
            else if (root['color'])
                color = root['color'];

            var id = 0; //default id for the hub
            if(data['id'])
                id = data.id;
            else if (root['id'])
                id = root.id;

            var cx = 0;
            var cy = 0; //default cx and cy for the center of the hub
            if(data['cx'] && data['cy']){
                cx = data.cx;
                cy = data.cy;
            } else if(root['cx'] && root['cy']){
                cx = root.cx;
                cy = root.cy;
            }

            var rootType = data.root.type;
            var distance = 40; //default distance
            if(data["distance"]){ //if the distance between the root and children is specified
                distance = data["distance"];
                if(rootType=='person')
                    distance = 1.5*distance;
            }
            var n = data.children.length;

            //use d3Group to put everything into one g
            var d3Group = d3.select(this).append('g').attr('id','hub'+id).attr('class','hub');

            //drawing lines between person and their interests
            if(rootType == "person"){
                var gradient = d3.select('defs')
                    .append("radialGradient")
                    .attr("id", "connection_gradient")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("fx", cx)
                    .attr("fy", cy)
                    .attr('r',100)
                    .attr("gradientUnits","userSpaceOnUse")
//                    .attr('spread-method','reflect');

                gradient.append("stop")
                    .attr("offset", "30%")
                    .style("stop-color", "#b2b2b2")
                    .style("stop-opacity", 1.0);

                gradient.append("stop")
                    .attr("offset", "90%")
                    .style("stop-color", "#FFFFFF")
                    .style("stop-opacity", 1.0);

//                d3Group.append('rect').attr('x',cx).attr('y',cy).attr('width','100').attr('height','100').attr('fill','url(#connection_gradient)');

                d3Group
//                    .selectAll('g.connectionPaths')
                    .append('g')
                    .attr('class','connectionPaths')
                    .selectAll('g.connectionPaths')
                    .data(new Array(n)).enter().append("line")
                    .attr("x1", cx)
                    .attr("y1", cy)
                    .attr("x2", function(d, i){
                        var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n-Math.PI/2);
                        return cx_child;
                    })
                    .attr("y2", function(d, i){
                        var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n+Math.PI/2);
                        return cy_child;
                    })
                    .attr("stroke-width", 6)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-dasharray", "1, 10")
//                    .attr("fill", 'null')
                    .attr("stroke", 'url(#connection_gradient)')
                    .attr("opacity",0.0);
            }

            //drawing children with animation
            var childrenTemplate = MC.interest().setCssClass("interest")
                .setColor(function(d){
                    var relatednessMap = data.relatednessMap;    //Use relatedness data structure, not clusterMap in future
                    var hubColors = data.root.interestColors;
                    if(rootType=='person'){
                        for(var i in relatednessMap){
                            for(var j = 0; j < relatednessMap[i].length;j++){
                                if(d.id == relatednessMap[i][j] && data.id != i){
                                    return hubColors[i];
                                }
                            }

                        }
                    }
                    return data.color;

                });
            d3Group.datum(data.children).call(childrenTemplate); //drawing child nodes

            var childGs = d3Group
                .selectAll("g.interest");

            childGs
                .attr('opacity', 0)
                .attr('transform', function () {
                    return 'translate(' + cx + ', ' + cy + ')';
                });

            var duration=hub.getDuration();

            childGs
                .transition()
                .delay(1501)//then move the circles
                .attr('opacity', 1.0)
                .duration(function(d,i){
                    return duration/n*(i+1);
                })
                .attr('transform', function (d, i) {
                    var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n-Math.PI/2); //start from the top
                    var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n+Math.PI/2);
                    return 'translate(' + cx_child + ', ' + cy_child + ')';
                });

            //drawing root
            var rootType = data.root.type;

            if(rootType == "interest"){
                var interestTemplate = MC.interest()
                    .setCssClass("hubRoot")
                    .setCx(cx).setCy(cy)
                    .setR(root.r)
                    .setColor(function(d){
                        return d.color ? d.color : color;
                    });
                d3Group.datum([data.root]).call(interestTemplate);
            }
            else{
                var personRoot = MC.person()
                    .setCx(cx)
                    .setCy(cy)
                    .setCssClass('hubRoot'); //setting the class name of the root

                var personR = personRoot.getR();
                var personImageWidth = personRoot.getImageWidth();
                var personImageHeight = personRoot.getImageHeight();
                var scale = 1.5;
                personRoot.setR(personR*scale);
                personRoot.setImageWidth(personImageWidth*scale);
                personRoot.setImageHeight(personImageHeight*scale);

                d3Group
                    .datum([data.root])
                    .call(personRoot);
            }
            if(data['isVizRoot']){
                d3Group
                    .select('g.hubRoot')
                    .attr("class","vizRoot");

                d3Group
                    .select('g.vizRoot')
                    .transition()
                    .duration(0)
                    .attr('opacity',1.0);
                d3Group
                    .select('g.vizRoot')
                    .select('text')
                    .attr('fill','black');
            }else {
                d3Group
                    .select('g.hubRoot')
                    .attr('opacity',0.0);

                d3Group
                    .select('g.hubRoot')
                    .transition()
                    .duration(data['delay'])
                    .attr('opacity',1.0);
            }

            //Making connection lines appear
            d3Group.selectAll("line").transition().delay(1501).duration(function(d,i){
                return duration/n*(i+1);
            }).attr('opacity',1.0);
        });
    }

    MC.options.register(hub, 'id', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) {
        return d.r;
    });
    MC.options.register(hub, 'duration', 500);
    MC.options.register(hub, 'cssClass', 'hub');

//    MC.options.register(hub, 'regularFill', 'green');
//    MC.options.register(hub, 'highlightedFill', 'black');
//    MC.options.register(hub, 'selectHub',function(){
//        d3Group.style('fill', hub.getRegularFill());
//    });
//    MC.options.register(hub, 'deselectHub',function(){
//        d3Group.style('fill', hub.getHighlightedFill());
//    });

    return hub;
};