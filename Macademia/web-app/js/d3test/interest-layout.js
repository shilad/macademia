var MC = (window.MC = (window.MC || {}));

MC.interestLayout = function() {
    // We presume there's only one interest layout. Is this bad?
    function il(container) {
        var diam = il.getOrCallDiameter();
        var cm = il.getOrCallClusterMap();
        var interestNodes =  il.getInterestNodes();
        var interests = {};
        $.each(il.getOrCallInterests(), function (i, d) {
            interests[d.id] = d;
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
                i.r = 20;
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
                i.r = 20;
                var children = idsToInterests(cm[i.id]);
                $.each(children, function(index, value){
                    console.log(i.name + ": " + i.color);
                    value.color = i.color;
                    value.r = 5;
                    console.log(value.name + ": " + value.color);
                });

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

//        var tree = d3.layout.tree()
//            .sort(null)
//            .size([360, diam / 2 - 50])
//            .children(getChildren);

        var nodes = getChildren(interests);


        // adjust the radial layout.
        // In the layout x is degrees (or radians?)
        // Y is distance from the center.
        $.each(nodes, function (i) {
            // closely related to root
            if (this.type == 'cr') {
                this.y *= 0.5;
            } else if (this.type == 'hub') {  // hubs
                this.y *= 1.5;
                this.r = 10;
            } else if (this.type == 'leaf') {
                // cornerness fans out the short
                var rads = this.x / 180 * Math.PI;
                var cornerness = Math.min(
                    Math.abs(Math.tan(rads)),
                    Math.abs(1.0/Math.tan(rads))
                );
                this.y *=(1.0)* Math.sqrt(Math.max(1.2 * cornerness, 1.0));
            }
            console.log(this.name + ": " + this.r);
        });

        var links=[];
        console.log("Nodes");
        console.log(nodes);

        for(var node in nodes){
//             links.push({"id":nodes[node].id,"source":nodes[node].parentId,"target":nodes[node].clusterId});
            links.push(node);
            console.log(node);
        }

        var diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        var group = container.append("g")
            .attr("transform", "translate(" + diam / 2 + "," + diam / 2 + ")")

        var link = group.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", "#bbb")
            .style('fill', 'none')
            .style("stroke-dasharray", function(d) {
                console.log(d);
                if(d.source ==undefined && d.target == undefined){
                    return "0";
                }else if (d.source in cm && d.target in cm) {
                    return "0";
                } else {
                    return "2,3";
                }
            })
            .attr("d", function (d) {

                if (d.source in cm && d.target in cm) {
                    return null;
                }else if (d.source==rootId && !(d.target in cm)){
                    return diagonal(d);
                } else {
                    return diagonal(d);
                }
            });

        var positions = group.selectAll(".positionNodes")
            .data(nodes)
            .enter().append("circle")
            .attr('r', 5)
            .style('fill', 'none')
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        var svg = d3.select('svg');

        var interestNodesById = {};
        interestNodes.each(function(d, i) {
            interestNodesById[d.id] = this;
        });
        positions.each(function (d, i) {
            var node = interestNodesById[d.id];
            if (node) {
                var pos = MC.getTransformedPosition(svg[0][0], this, 0, 0);
                console.log(pos);
                d.cx = pos.x;
                d.cy = pos.y;
            }
        });

        svg.datum(il.getOrCallInterests())
            .call(MC.interest());

        interestNodes.classed("hub", function(d) { return (d.id in cm); });
        interestNodes.classed("leaf", function(d) { return !(d.id in cm); });
    }

    MC.options.register(il, 'cssClass', 'label');
    MC.options.register(il, 'diameter', 1000);
    MC.options.register(il, 'rootId', null);
    MC.options.register(il, 'clusterMap', function() { throw('no clusterMap specified'); });
    MC.options.register(il, 'interests', function() { throw('no interests specified.')});
    MC.options.register(il, 'interestNodes', function() { throw('no interest nodes specified.')});

    return il;
};