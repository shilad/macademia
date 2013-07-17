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

            //drawing root
            var klassRoot = hub.getCssClass()+"Root";
            console.log(data.root);
            console.log(data.children);
            var allRoot = d3.select(this).selectAll("g." + klassRoot).data(data.root);
            console.log(allRoot);
            allRoot.enter().append('g').attr('class',klassRoot).append('circle').attr('r',data.root[0].r);
            allRoot.transition().attr('transform', function (d, i) {
                var cx = hub.getOrCallCx(d, i);
                var cy = hub.getOrCallCy(d, i);
                console.log('setting cx to ' + cx);
                console.log('setting cy to ' + cy);
                return 'translate(' + cx + ', ' + cy + ')';
            });

            //drawing children (working!)
            var rootX = data.root[0].cx;
            var rootY = data.root[0].cy;
            var distance = 50;

            var cloneChildren = $.extend(true,[],data.children);//clone the children array
            var n = cloneChildren.length;

            //the children need to be told where to go (setting the cx and cy).
            $.each(cloneChildren,function(i,v){
                v["cx"] = rootX + distance * Math.cos((i+1)*2*Math.PI/n);
                v["cy"] = rootY - distance * Math.sin((i+1)*2*Math.PI/n);
            });

            var klassChild = hub.getCssClass()+"Child";
            var allChildren = d3.select(this).selectAll("g." + klassChild).data(cloneChildren, function (d) { console.log(d); return d.id; });

            allChildren.enter().append('g').attr('class',klassChild).append('circle').attr('r',5);

            allChildren.transition().attr('transform', function (d, i) {
                var cx = hub.getOrCallCx(d, i);
                var cy = hub.getOrCallCy(d, i);
                console.log('setting cx to ' + cx);
                console.log('setting cy to ' + cy);
                return 'translate(' + cx + ', ' + cy + ')';
            });
        });
    }

    MC.options.register(hub, 'id', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });
    MC.options.register(hub, 'cssClass', 'hub');

    return hub;
};