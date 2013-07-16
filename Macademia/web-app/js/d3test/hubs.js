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

            var rootG = d3.select("g." + klass).data(data.root);
            var children = d3.select("g." + klass).data(data.children); //this is an array

            rootG.cx = fdshfadjajsfd;
            rootG.cy = jsajdfsjsdfss;

            children.each( function(data) {
                    data.cx = sdfjsd;
                    data.cy = sdjadj;
                }
            ); //set cx and cy for children

            rootG.attr('transform', function(d,i){
                var cx = hub.getOrCallCx(d, i);
                var cy = hub.getOrCallCy(d, i);
                console.log('setting cx to ' + cx);
                return 'translate(' + cx + ', ' + cy + ')';
            });



        });
    }

    MC.options.register(hub, 'rootId', null);
    MC.options.register(hub, 'cx', function (d) { return d.cx; });
    MC.options.register(hub, 'cy', function (d) { return d.cy; });
    MC.options.register(hub, 'r', function(d) { return d.r; });

    return hub;
}