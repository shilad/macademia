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
            var klass = hub.getCssClass();

            var rootX = data.root.cx;
            var rootY = data.root.cy;
            var distance = 100;

            var cloneChildren = $.extend(true,[],data.children);//clone the children array
            var n = cloneChildren.length;

            //the children need to be told where to go (setting the cx and cy).
            $.each(cloneChildren,function(i,v){
                v["cx"] = rootX + (i+1) * distance * Math.cos(2*Math.PI/n);
                v["cy"] = rootX - (i+1) * distance * Math.sin(2*Math.PI/n);
            });

            var rootG = d3.select("g." + klass).data(data.root);
            var children = d3.select("g." + klass).data(cloneChildren); //this is an array

            //drawing root
            rootG.attr('transform', function(d,i){
                var cx = hub.getOrCallCx(d, i);
                var cy = hub.getOrCallCy(d, i);
                console.log('setting cx to ' + cx);
                console.log('setting cy to ' + cy);
                return 'translate(' + cx + ', ' + cy + ')';
            });

        });
    }

    MC.options.register(hub, 'rootId', function(d){return d.id});
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });
    MC.options.register(hub, 'cssClass', 'hub');

    return hub;
};