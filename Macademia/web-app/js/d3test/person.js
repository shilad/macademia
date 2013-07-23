var MC = (window.MC = (window.MC || {}));


MC.person = function() {
    function person(selection) {
        selection.each(function(data) {
            var klass = interest.getCssClass();

            var allGs = d3.select(this)
                .selectAll("g." + klass)
                .data(data, function (d) { return d.id; });

            var newGs = allGs.enter().append('g')
                .attr('class', klass)
                .attr('opacity', 0.0);

            if(allGs.exit().size() > 0){
                allGs.exit().transition().remove()
                    .attr('opacity', 0.0)
                    .duration(100);
            }

            var img = newGs.append("image")
                .attr("xlink:href", person.getPic())
                .attr("height", person.getImageHeight())
                .attr("width", person.getImageWidth())
                .attr("transform", function (d, i) {
                    var w = person.getOrCallImageWidth(d, i);
                    var h = person.getOrCallImageHeight(d, i);
                    return 'translate(-' + (w/2) + ', -' + (h/2) + ')';
                });

            var arc = d3.svg.arc()
                .innerRadius(function (d, i) {
                    var w = person.getOrCallImageWidth(d, i);
                    var h = person.getOrCallImageHeight(d, i);
                    return Math.min(w, h) / 2;
                })
                .outerRadius(person.getR());

            var pieLayout = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.weight;
                });

            var personToWedges = function(d) {
                var wedges = [];
                for (var iid in d.relevance) {
                    if (iid != 'overall' && iid != -1) {
                        wedges.push({
                            weight :d.relevance[iid],
                            color : d.interestColors[iid]
                        })
                    }
                }
                return pieLayout(wedges);
            };

            var pie = g.append("g")
                .selectAll("path")
                .data(personToWedges)
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("stroke", "#FFFFFF")
                .attr("fill", function (d, i) { return d.data.color; });

            person.getOrCallOnHover().forEach(function (v) {
                g.on('mouseover', v[0]);
                g.on('mouseout', v[1]);
            });

            var l = MC.label()
                .setText(person.getText())
                .setY(function (d, i) {
                    var r = person.getOrCallR(d, i);
                    return "" + (r+11) + "px";
                })
                .setAlign('middle');

            newGs.call(l);

            allGs.transition()
                .duration(200)
                .attr('transform', function (d, i) {
                    var cx = person.getOrCallCx(d, i);
                    var cy = person.getOrCallCy(d, i);
                    return 'translate(' + cx + ', ' + cy + ')';
                });
        });
    }


    MC.options.register(person, 'interests', function (){throw('no interests specivied')});
    MC.options.register(person, 'text', function (d, i) { return d.name; });
    MC.options.register(person, 'pic', function (d, i) { return d.pic; });
    MC.options.register(person, 'cx', function (d) { return d.cx; });
    MC.options.register(person, 'cy', function (d) { return d.cy; });
    MC.options.register(person, 'imageWidth', 28);
    MC.options.register(person, 'imageHeight', 42);
    MC.options.register(person, 'r', 25);
    MC.options.register(person, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(person, 'cssClass', 'person');

    return person;
};
