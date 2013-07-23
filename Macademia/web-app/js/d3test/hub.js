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

//                        <defs>
//                            <linearGradient id="grad">
//                                <stop offset="3%" stop-color="#b2b2b2"/>
//                                <stop offset="97%" stop-color="#FFFFFF"/>
//                            </linearGradient>
//                        </defs>
//
//            <line x1="20" y1="20" x2="200" y2="200" fill="none" stroke-width="20" stroke-linecap="round" stroke-dasharray="1, 30"
//            stroke="url(#grad)"/>

            //drawing connections between person and their interests
            var rootType = data.hubRoot[0].type;
            var distance = 30; //default distance
            if(data["distance"]){ //if the distance between the root and children is specified
                distance = data["distance"];
            }
            var n = data.children.length;

            if(rootType == "person"){
                var gradient = d3Group.append("defs")
                    .append("radialGradient")
                    .attr("id", "connection-gradient")
//                    .attr("x1", cx)
//                    .attr("y1", cy);

                    gradient.append("stop")
                    .attr("offset", "3%")
                    .attr("stop-color", "#b2b2b2")
                    .attr("stop-opacity", 1);

                    gradient.append("stop")
                    .attr("offset", "97%")
                    .attr("stop-color", "#FF0000")
                    .attr("stop-opacity", 1);



                d3Group.selectAll("connectionPaths").data(new Array(n)).enter().append("line")
                    .attr("x1", cx)
                    .attr("y1", cy)
                    .attr("x2", function(d, i){
                        var cx_child = cx + distance * Math.cos((i+1)*2*Math.PI/n);
                        return cx_child;
                    })
                    .attr("y2", function(d, i){
                        var cy_child = cy - distance * Math.sin((i+1)*2*Math.PI/n);
                        return cy_child;
                    })
                    .attr("stroke-width", 15)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-dasharray", "1, 15")
                    .attr("stroke", 'url(#connection-gradient)');
//                    .attr("stroke", 'black');
            }

            //drawing children with animation
            var childrenTemplate = MC.interest().setCssClass("interest")
                .setColor(function(d){
                    return d.color ? d.color : color;
                });
            d3Group.datum(data.children).call(childrenTemplate); //drawing child nodes

            var childGs = d3Group.selectAll("g."+"interest");
//            console.log("g.child"+id);
            childGs.attr('opacity', 1.0).transition()  //setting the group to the root position first
                .duration(10)
                .attr('transform', function (d, i) {
                    return 'translate(' + cx + ', ' + cy + ')';
                });

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
            if(rootType == "interest"){
                var interestTemplate = MC.interest()
                    .setCssClass("hubRoot")
                    .setCx(cx).setCy(cy)
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
            if(data.root['isVizRoot']){
                d3Group
                    .select('g.hubRoot')
                    .attr("class","vizRoot");
            }


            //building user interactions

            //mouseover the interest node hightlight itself and its hub root
            d3Group.selectAll(".interestOuter").on('mouseover',function(e){
                d3Group.select("g .hubRoot").attr('opacity',1.0).classed('active',true);
                d3Group.select("g .vizRoot").attr('opacity',1.0).classed('active',true);
                d3.select(this.parentNode).select('g .label text').text(MC.interest().getText());
                // notice that we are replacing class interest with active
                d3.select(this.parentNode).attr('class','activeInterest');
            });

            d3Group.selectAll(".interestOuter").on('mouseout',function(){
                d3Group.select("g .hubRoot").classed('active',false);
                d3Group.select("g .vizRoot").classed('active',false);
                d3.select(this.parentNode).select('g .label text').text(MC.interest().getCleanedText());
                d3.select(this.parentNode).attr('class','interest');
            });

            //mouseover the hub root hightlight everything in the hub
            d3Group.selectAll("g .hubRoot").on('mouseover',function(e){
                d3.select(this).attr('opacity',1.0).classed('active',true);
                d3Group.selectAll("g .interest").attr('class','activeInterest');
            });

            d3Group.selectAll("g .hubRoot").on('mouseout',function(e){
                d3.select(this).classed('active',false);
                d3Group.selectAll("g .activeInterest").attr('class','interest');
            });



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
    MC.options.register(hub, 'r', function(d) {
        return d.r;
    });
    MC.options.register(hub, 'duration', 1000);
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