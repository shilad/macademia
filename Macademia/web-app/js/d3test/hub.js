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
            console.log(data);
            //The following code draws interests based on data

            //Getting basic info
            var root  = data.hubRoot[0];

            var color = 0.5; //default color for children
            if(data['color']){
                color = data['color'];
                console.log(data['color']);
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
                    if(d.color){
                        return MC.hueToColor(d.color);
                    } else {
                        return MC.hueToColor(color);
                    }
                });
            d3Group.datum(data.children).call(childrenTemplate); //drawing child nodes

            var childGs = d3Group.selectAll("g."+"interest");
            console.log("g.child"+id);
            childGs.attr('opacity', 1.0).transition()  //setting the group to the root position first
                .duration(10)
                .attr('transform', function (d, i) {
                    return 'translate(' + cx + ', ' + cy + ')';
                });

            var n = data.children.length;
            var distance = 50; //default distance
            if(data["distance"]){ //if the distance between the root and children is specified
                distance = data["distance"];
            }

            var duration=hub.getDuration();
            childGs.attr('opacity', 1.0).transition() //then move the circles
                .duration(function(d,i){
                    return duration/n*(i+1);
                })
                .attr('transform', function (d, i) {
                    var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n);
                    var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n);
                    return 'translate(' + cx_child + ', ' + cy_child + ')';
                })
                .transition();

            //drawing root
            var rootType = data.hubRoot[0].type;

            if(rootType == "interest"){
                var interestTemplate = MC.interest().setCssClass("interestHubRoot").setCx(cx).setCy(cy);
                d3Group.datum(data.hubRoot).call(interestTemplate);
            }
            else{
                var personRoot = MC.person()
                    .setCx(cx)
                    .setCy(cy)
                    .setCssClass('personHubRoot') //setting the class name of the root

                var personR = personRoot.getR();
                var personImageWidth = personRoot.getImageWidth();
                var personImageHeight = personRoot.getImageHeight();
                var scale = 1.5;
                personRoot.setR(personR*scale);
                personRoot.setImageWidth(personImageWidth*scale);
                personRoot.setImageHeight(personImageHeight*scale);

                d3Group
                    .selectAll('personHubRoot')
                    .data([0])
                    .append('g')
                    .attr('class', 'personHubRoot')
                    .data(data.hubRoot)
                    .enter()
                    .call(personRoot);
            }

        });
    }

    MC.options.register(hub, 'id', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });
    MC.options.register(hub, 'duration', 1000);
    MC.options.register(hub, 'cssClass', 'hub');

    return hub;
};