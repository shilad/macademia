var MC = (window.MC = (window.MC || {}));

MC.interestLayout = function() {
    // We presume there's only one interest layout. Is this bad?
    function il(g) {
        var diam = il.getOrCallDiameter();
        var cm = il.getOrCallClusterMap();
        var interests = {};
        il.getOrCallInterestSelection().each(function (d, i) {
            interests[d.id] = d;
        });
        var rootId = il.getOrCallRootId();

        var getChildren = function (i) {
            if (i.id == rootId) {    // i.e. "data mining" in our example
                // a list of ids that are children of this node (or null)
                var closelyRelated = cm[i.id];

                // siblings are the other keys in the cm (besides 18)
                var siblings = [];
                for (var iid in cm) {
                    if (iid != rootId) {
                        interests[iid].siblingIndex = siblings.length;
                        siblings.push(iid);
                    }
                }

                // Thsi distributes the closely related nodes between the sibilings
                for (var j = closelyRelated.length-1; j >= 0; j--) {
                    var destIndex = (d3.keys(cm).length - 1) * j / closelyRelated.length;    // TODO: adjust for non-interest-centric graphs
                    siblings.splice(Math.round(destIndex), 0, closelyRelated[j]);
                }

                return siblings;
            } else if (i.id in cm) {
                // a non-root hub (e.g. mathematics)
                var children = $.map(cm[i.id], function (iid) { return interests[iid]; });

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
            } else {
                return null;
            }
        };

        var tree = d3.layout.tree()
            .sort()
            .size([360, diam / 2 - 50])
            .children(getChildren);

        var nodes = tree.nodes(interests[rootId]);

        // adjust the radial layout.
        // In the layout x is degrees (or radians?)
        // Y is distance from the center.
        $.each(nodes, function (i) {
            // closely related to root
            if (this.depth == 1 && this.siblingIndex >= 0) {
                this.y *= 1.75;
            } else if (this.depth == 1) {  // hubs
                this.y *= 0.8;
            } else if (this.depth == 2) {
                // cornerness fans out the short
                var rads = this.x / 180 * Math.PI;
                var cornerness = Math.min(
                    Math.abs(Math.tan(rads)),
                    Math.abs(1.0/Math.tan(rads))
                );
                this.y *= Math.sqrt(Math.max(1.2 * cornerness, 1.0));
            }
        });

        var links = tree.links(nodes);

        var diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        var svg = d3.select("body").append("svg")
            .attr("width", diam)
            .attr("height", diam)
            .append("g")
            .attr("transform", "translate(" + diam / 2 + "," + diam / 2 + ")");

        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("stroke-dasharray", function(d) {
                if (d.source.id in cm && d.target.id in cm) {
                    return "0";
                } else {
                    return "2,3";
                }
            })
            .attr("d", function (d) {
                if (d.source.id in cm && d.target.id in cm) {
                    return null;
                } else {
                    return diagonal(d);
                }
            });
    }

    MC.options.register(il, 'cssClass', 'label');
    MC.options.register(il, 'diameter', 800);
    MC.options.register(il, 'rootId', null);
    MC.options.register(il, 'clusterMap', function() { throw('no clusterMap specified'); });
    MC.options.register(il, 'interests', function() { throw('no interests specified.')});

    return il;
};