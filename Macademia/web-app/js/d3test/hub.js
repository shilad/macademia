/**
 * Created with IntelliJ IDEA.
 * User: research
 * Date: 7/16/13
 * Time: 10:41 AM
 * To change this template use File | Settings | File Templates.
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

            //use d3Group to put everything into one g
            var d3Group = d3.select(this).append('g').attr('id','hub'+id).attr('class','hub');

            //drawing children with animation
            var childrenTemplate = MC.interest().setCssClass("interest")
                .setColor(function(d){
                    return d.color ? d.color : color;
                });
            d3Group.datum(data.children).call(childrenTemplate); //drawing child nodes

            var childGs = d3Group
                .selectAll("g.interest");

            childGs
                .attr('opacity', 0)
                .attr('transform', function () {
                    return 'translate(' + cx + ', ' + cy + ')';
                });

            var n = data.children.length;
            var distance = 50; //default distance
            if(data["distance"]){ //if the distance between the root and children is specified
                distance = data["distance"];
            }

            var duration=hub.getDuration();

            childGs

                .transition()
                .delay(1501)//then move the circles
                .attr('opacity', 1.0)
                .duration(function(d,i){
                    return duration/n*(i+1);
                })
                .attr('transform', function (d, i) {
                    var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n);
                    var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n);
                    return 'translate(' + cx_child + ', ' + cy_child + ')';
                });

            //drawing root
            var rootType = data.root.type;
//            console.log(data);
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
                    .selectAll('hubRoot')
                    .data([0])
                    .append('g')
                    .attr('class', 'hubRoot')
                    .data([data.root])
                    .enter()
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
    MC.options.register(hub, 'regularFill', '#C0C0C0');
    MC.options.register(hub, 'highlightedFill', 'black');
    MC.options.register(hub, 'selectHub',function(){
        d3Group.style('fill', hub.getRegularFill());
    });
    MC.options.register(hub, 'deselectHub',function(){
        d3Group.style('fill', hub.getHighlightedFill());
    });

    return hub;
};