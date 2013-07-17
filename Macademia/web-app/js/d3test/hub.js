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
            console.log("Inside Each");
            var klass = hub.getCssClass();

            var rootX = data.root.cx;
            var rootY = data.root.cy;
            var distance = 100;

            var cloneChildren = $.extend(true,[],data.children);//clone the children array
            console.log(data.children);
            var n = cloneChildren.length;

            //the children need to be told where to go (setting the cx and cy).
            $.each(cloneChildren,function(i,v){
                v["cx"] = rootX + (i+1) * distance * Math.cos(2*Math.PI/n);
                v["cy"] = rootX - (i+1) * distance * Math.sin(2*Math.PI/n);
            });

            var rootG = d3.selectAll("g." + klass).data(data.root);
            console.log(rootG);
            var children = d3.selectAll("g." + klass).data(cloneChildren); //this is an array

            var newChildren = children.enter().append('g')
                .attr('class',klass);

            newChildren.append('circle');

            children.transition().delay(500).duration(500).attr('transform', function (d, i) {
                var cx = hub.getOrCallCx(d, i);
                var cy = hub.getOrCallCy(d, i);
                console.log('setting cx to ' + cx);
                return 'translate(' + cx + ', ' + cy + ')';
            });

            children.select('circle')
                .attr('r', hub.getR());



            //drawing root
//            console.log(rootG[0]);
//            console.log(children);
//            rootG.enter().append('p').text("Where are my dragons?!?!?!?!");
//                .attr('class', klass);

//            rootG.attr('transform', function(d,i){
//                var cx = hub.getOrCallCx(d, i);
//                var cy = hub.getOrCallCy(d, i);
//                console.log('setting cx to ' + cx);
//                console.log('setting cy to ' + cy);
//                return 'translate(' + cx + ', ' + cy + ')';
//            });

            //drawing children
//            children.attr('transform', function (d, i) {
//                var cx = hub.getOrCallCx(d, i);
//                var cy = hub.getOrCallCy(d, i);
//                console.log('setting cx to ' + cx);
//                return 'translate(' + cx + ', ' + cy + ')';
//            });
//                        fade in new g's
//            children.transition()
//                .delay(1000)
//                .attr('opacity', 1.0)
//                .duration(500);

            // Change fill for both existing and new elements
//            children.select('circle')
//                .attr('r', hub.getR());

        });
    }

    MC.options.register(hub, 'id', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });
    MC.options.register(hub, 'cssClass', 'hub');

    return hub;
};