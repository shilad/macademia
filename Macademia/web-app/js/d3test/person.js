var MC = (window.MC = (window.MC || {}));


MC.person = function() {

    function person(g) {
        g.call(function (d) { console.log(d)});
        var g = g.append('g')
            .attr('class', person.getCssClass())
            .attr('transform', function (d, i) {
                var cx = person.getOrCallCx(d, i);
                var cy = person.getOrCallCy(d, i);
                return 'translate(' + cx + ', ' + cy + ')';
            });

        var img = g.append("image")
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
            for (var iid in d.cleanedRelevance) {
                wedges.push({
                    weight :d.cleanedRelevance[iid],
                    color : 'pink'

                });
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

        g.call(l);

        var interests = {};

        return g;
    }


    MC.options.register(person, 'interests', function (d,i){return d.interests});
    MC.options.register(person, 'text', function (d, i) { return d.name; });
    MC.options.register(person, 'pic', function (d, i) { return d.pic; });
    MC.options.register(person, 'cx', 100);
    MC.options.register(person, 'cy', 100);
    MC.options.register(person, 'imageWidth', 28);
    MC.options.register(person, 'imageHeight', 42);
    MC.options.register(person, 'r', 25);
    MC.options.register(person, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(person, 'cssClass', 'person');

    return person;
};
