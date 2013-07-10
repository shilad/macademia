var MC = (window.MC = (window.MC || {}));

MC.interestLayout = function() {
    // We presume there's only one interest layout. Is this bad?
    function il(container) {
        var diam = il.getOrCallDiameter();
        var cm = il.getOrCallClusterMap();
        var interestNodes =  il.getInterestNodes();
        var interests = {};
        $.each(il.getOrCallInterests(), function (i, d) {
            var clone = $.extend(true, {}, d);
            interests[clone.id] = clone;
        });

        var rootId = il.getOrCallRootId();
        var idsToInterests = function(ids) {
            return $.map(ids, function (id) {
                return interests[id];
            });
        };

        var getChildren = function (i) {
            if (i.id == rootId) {    // i.e. "WINNING" in our example
                i.type = 'root';
                var closelyRelated = [];
                var hubs = [];

                $.each(cm[rootId], function (i, iid) {
                    if (iid == rootId) {
                        // skip the root itself
                    } else if (iid in cm) {
                        hubs.push(iid);
                    } else {
                        interests[iid].siblingIndex = closelyRelated.length;
                        closelyRelated.push(iid);
                    }
                });

                // This distributes the closely related nodes between the hubs
                for (var j = closelyRelated.length-1; j >= 0; j--) {
                    var destIndex = (d3.keys(cm).length - 1) * j / closelyRelated.length;    // TODO: adjust for non-interest-centric graphs
                    hubs.splice(Math.round(destIndex), 0, closelyRelated[j]);
                }
                return idsToInterests(hubs);
            } else if (i.id in cm) {
                // a non-root hub (e.g. mathematics)
                i.type = 'hub';
                console.log("found a hub");

                var children = idsToInterests(cm[i.id]);

                // sort so short names are near the beginning or end
                children.sort(function (i1, i2) { return i1.name.length - i2.name.length});
                var odd  = children.filter(function (v, i) { return i % 2 == 1; });
                var even = children.filter(function (v, i) { return i % 2 == 0; });
                even.reverse();
                if (i.siblingIndex % 2 == 0) {
                    return odd.concat(even);
                } else {
                    return even.concat(odd);
                }
            } else if ($.inArray(i.id, cm[rootId]) != -1) {
                i.type = 'cr'; //closely related
                return null;
            } else {
                i.type = 'leaf';
                return null;
            }
        };

    var tree = d3.layout.tree()
        .sort(null)
        .size([360, diam / 2 - 50])
        .children(getChildren);

    var nodes = tree.nodes(interests[rootId]);


    // adjust the radial layout.
    // In the layout x is degrees (or radians?)
    // Y is distance from the center.
    $.each(nodes, function (i) {
        console.log(this.id + ": " + this.type);

        if(this.type){
            console.log("got in here:")
        }
        // closely related to root
        if (this.type == 'cr') {
                console.log("found a cr");
            this.y *= 0.5;
        } else if (i.type == 'hub') {  // hubs
                console.log("found a hub");
            this.y *= 5.5;
        } else if (this.type == 'leaf') {
            // cornerness fans out the short
            var rads = this.x / 180 * Math.PI;
            var cornerness = Math.min(
                Math.abs(Math.tan(rads)),
                Math.abs(1.0/Math.tan(rads))
            );
                console.log("found a leaf");
            this.y *= Math.sqrt(Math.max(1.2 * cornerness, 1.0));
        }
    });

    var links = tree.links(nodes);

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

//        var inDiagonal = d3.svg.diagonal.radial()
//            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    var group = container.append("g")
        .attr("transform", "translate(" + diam / 2 + "," + diam / 2 + ")")


    var link = group.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .style("stroke", "#bbb")
        .style('fill', 'none')
        .style("stroke-dasharray", function(d) {
            if (d.source.id in cm && d.target.id in cm) {
                return "0";
            } else {
                return "2,3";
            }
        })
        .attr("d", function (d) {
            if (d.source.id in cm && d.target.id in cm) {
                return null;
            }else if (d.source.id==rootId && !(d.target.id in cm)){
                return diagonal(d);
            } else {
                return diagonal(d);
            }
        });

    var positions = group.selectAll(".positionNodes")
        .data(nodes)
        .enter().append("circle")
        .attr('r', 5)
        .style('fill', 'red')
        .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        });

    var svg = d3.select('svg');


    var interestNodesById = {};
    interestNodes.each(function(d, i) {
        interestNodesById[d.id] = this;
    });
    positions.each(function (d, i) {
        var pos = MC.getTransformedPosition(svg[0][0], this, 0, 0);
        if (interestNodesById[d.id]) {
            d3.select(interestNodesById[d.id]).attr('transform', 'translate(' + pos.x + ',' + pos.y + ')');
        }
    });
//
    interestNodes.attr("class",
        function(d) {
            return (d.id in cm) ? 'hub' : 'leaf'
        });
//            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
}

MC.options.register(il, 'cssClass', 'label');
MC.options.register(il, 'diameter', 800);
MC.options.register(il, 'rootId', null);
MC.options.register(il, 'clusterMap', function() { throw('no clusterMap specified'); });
MC.options.register(il, 'interests', function() { throw('no interests specified.')});
MC.options.register(il, 'interestNodes', function() { throw('no interest nodes specified.')});

return il;
};