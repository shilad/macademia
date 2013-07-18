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

            var color = 0.5; //default color for children
            if(data['color'])
                color = data['color'];
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

            //drawing root
            var rootType = data.hubRoot[0].type;

            if(rootType == "interest"){
                var interestTemplate = MC.interest().setCssClass("interestRoot"+id).setCx(cx).setCy(cy);
                d3Group.datum(data.hubRoot).call(interestTemplate);
            }
            else{
                var personRoot = MC.person()
                    .setCx(cx)
                    .setCy(cy)
                    .setCssClass('personRoot'+id) //setting the class name of the root
                d3Group
                    .selectAll('personRoot'+id)
                    .data([0])
                    .append('g')
                    .attr('class', 'personRoot'+id)
                    .data(data.hubRoot)
                    .enter()
                    .call(personRoot);
            }

            //drawing children with animation
            var cloneChildrenOld = $.extend(true,[],data.children);//clone the children array
            var childrenTemplateOld = MC.interest().setCssClass("child"+id).setCx(cx).setCy(cy);
            d3Group.datum(cloneChildrenOld).call(childrenTemplateOld);

            var distance = 50;
            if(data["distance"]){ //if the distance between the root and children is specified
                distance = data["distance"];
            }

            var cloneChildren = $.extend(true,[],data.children);//clone the children array
            var n = cloneChildren.length;

            //the children need to be told where to go (setting the cx and cy).
            $.each(cloneChildren,function(i,v){
                v["cx"] = cx + distance * Math.cos((i+1)*2*Math.PI/n);
                v["cy"] = cy - distance * Math.sin((i+1)*2*Math.PI/n);
                if(!v["color"]){ //if the child does not have its own color
                    v["color"] = color; //assign the color of the parent
                }
            });

            window.setTimeout(function() {
                var childrenTemplate = MC.interest().setCssClass("child"+id);
                d3Group.datum(cloneChildren).call(childrenTemplate);
            },1000);


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