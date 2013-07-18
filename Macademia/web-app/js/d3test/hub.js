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
            var root  = data.hubRoot[0];

            var color = data.color; //default color for children
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


            childGs.attr('opacity', 1.0).transition() //then move the circles
                .duration(function(d,i){
                    return 1000/n*(i+1);
                })
                .attr('transform', function (d, i) {
                    var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n);
                    var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n);
                    return 'translate(' + cx_child + ', ' + cy_child + ')';
                });
//                .transition()
//                .delay(1000)
//                .attr('opacity',1.0)
//                .duration(200);

//            d3Group.selectAll("g.")
//                .transition()
//                .attr("cx", function(d,i){
//                    return cx + distance * Math.cos((i+1)*2*Math.PI/n);
//                })
//                .attr("cy", function(d,i){
//                    return cy - distance * Math.sin((i+1)*2*Math.PI/n);
//                });
//            var n = data.children.length;
//            var distance = 50; //default distance
//            if(data["distance"]){ //if the distance between the root and children is specified
//                distance = data["distance"];
//            }
//
//            childrenTemplate = MC.interest()
//                .setCssClass("child"+id)
//                .setCx(function(d,i){
//                    return cx + distance * Math.cos((i+1)*2*Math.PI/n);
//                })
//                .setCy(function(d,i){
//                    return cy - distance * Math.sin((i+1)*2*Math.PI/n);
//                })
//                .setColor(function(d){
//                    if(d.color){
//                        return MC.hueToColor(d.color);
//                    } else {
//                        return MC.hueToColor(color);
//                    }
//                });
//
//            child.call(childrenTemplate);

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
//                    .setR(25*1.5)
//                    .setImageWidth(28*1.5)
//                    .setImageHeight(42*1.5)
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



//            var cloneChildrenOld = $.extend(true,[],data.children);//clone the children array
//            var childrenTemplateOld = MC.interest().setCssClass("childOld"+id).setCx(cx).setCy(cy);
//            d3Group.datum(cloneChildrenOld).call(childrenTemplateOld);
//
//            var distance = 50; //default distance
//            if(data["distance"]){ //if the distance between the root and children is specified
//                distance = data["distance"];
//            }
//
//            var cloneChildren = $.extend(true,[],data.children);//clone the children array
//            var n = cloneChildren.length;
//
//            //the children need to be told where to go (setting the cx and cy).
//            $.each(cloneChildren,function(i,v){
//                v["cx"] = cx + distance * Math.cos((i+1)*2*Math.PI/n);
//                v["cy"] = cy - distance * Math.sin((i+1)*2*Math.PI/n);
//                if(!v["color"]){ //if the child does not have its own color
//                    v["color"] = color; //assign the color of the parent
//                }
//            });
//
//            window.setTimeout(function() {
//                var childrenTemplate = MC.interest().setCssClass("child"+id);
//                d3Group.datum(cloneChildren).call(childrenTemplate);
//            },1000);


            //The following code draws plain circles based on data
//            //drawing root
//            var klassRoot = hub.getCssClass()+"Root";
//            console.log(data.root);
//            console.log(data.children);
//            var allRoot = d3.select(this).selectAll("g." + klassRoot).data(data.root);
//            console.log(allRoot);
//            allRoot.enter().append('g').attr('class',klassRoot).append('circle').attr('r',data.root[0].r);
//            allRoot.transition().attr('transform', function (d, i) {
//                var cx = hub.getOrCallCx(d, i);
//                var cy = hub.getOrCallCy(d, i);
//                console.log('setting cx to ' + cx);
//                console.log('setting cy to ' + cy);
//                return 'translate(' + cx + ', ' + cy + ')';
//            });
//
//            //drawing children
//            var rootX = data.root[0].cx;
//            var rootY = data.root[0].cy;
//            var distance = 50;
//
//            var cloneChildren = $.extend(true,[],data.children);//clone the children array
//            var n = cloneChildren.length;
//
//            //the children need to be told where to go (setting the cx and cy).
//            $.each(cloneChildren,function(i,v){
//                v["cx"] = rootX + distance * Math.cos((i+1)*2*Math.PI/n);
//                v["cy"] = rootY - distance * Math.sin((i+1)*2*Math.PI/n);
//            });
//
//            var klassChild = hub.getCssClass()+"Child";
//            var allChildren = d3.select(this).selectAll("g." + klassChild).data(cloneChildren, function (d) { console.log(d); return d.id; });
//
//            allChildren.enter().append('g').attr('class',klassChild).append('circle').attr('r',5);
//
//            allChildren.transition().attr('transform', function (d, i) {
//                var cx = hub.getOrCallCx(d, i);
//                var cy = hub.getOrCallCy(d, i);
//                console.log('setting cx to ' + cx);
//                console.log('setting cy to ' + cy);
//                return 'translate(' + cx + ', ' + cy + ')';
//            });
        });
    }

    MC.options.register(hub, 'id', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });
    MC.options.register(hub, 'cssClass', 'hub');

    return hub;
};