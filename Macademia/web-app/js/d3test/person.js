var MC = (window.MC = (window.MC || {}));

/**
 * Creates a pie around a picture of the person with the persons name.
 *
 * A person MUST be an object with fields:
 * id, name, pic, relevance, interests
 *
 * Example usage:
 *   var peeps = {
        15830: {"id":15830,
            "name":"Luther Rea",
            "pic":"/Macademia/all/image/fake?gender=male&img=00285_940422_fa.png",
            "relevance":{
                "11":1.77,
                "overall":1.0769508928060532},
            "interests":[
                11,
                22]}
 *
 * var person = MC.person()
 * d3.select('svg')
            .datum(people)
            .call(person);
 *
 * Available attributes:
 *
 *  r: radius to the the outer edge of the pie. Also influences repositioning of label(name)
 *  cx: center x position
 *  cy: center y position
 *  text: persons name
 *  pic: persons picture
 *  onHover: A list option that takes two parameters.
 *               The first is called on mouseOver, the second on mouseOut.
 *               Both function take two arguments: the person and key.
 *  imageWidth: width of the persons picture
 *  imageHeight: height of the persons picture
 *  cssClass: class for <g> enclosing the label
 *
 * @return {Function}
 */

MC.person = function() {
    function person(selection) {
        selection.each(function(data) {
            var klass = person.getCssClass();
            var allGs = d3.select(this)
                .selectAll("g." + klass)
                .data(data, function (d) { return d.id; });

            // remove old people.
            if(allGs.exit().size() > 0){
                allGs.exit().transition().remove()
                    .attr('opacity', 0.0)
                    .duration(100);
            }

            // helper functions: set the position and size of elements
            // used for a transition in existing objects and initial
            // setting in new objects.
            var setAttrs = function(g) {
                // enclosing g position
                g.attr('transform', function (d, i) {
                    var cx = person.getOrCallCx(d, i);
                    var cy = person.getOrCallCy(d, i);
                    return 'translate(' + cx + ', ' + cy + ')';
                });

                // image attributes
                g.select('image')
                    .attr("height", person.getImageHeight())
                    .attr("width", person.getImageWidth())
                    .attr("transform", function (d, i) {
                        var w = person.getOrCallImageWidth(d, i);
                        var h = person.getOrCallImageHeight(d, i);
                        return ('translate(-' + (w/2) + ', -' + (h/2) + ')');
                    });

                var arc = d3.svg.arc()
                    .innerRadius(function (d, i) {
                        var w = person.getOrCallImageWidth(d, i);
                        var h = person.getOrCallImageHeight(d, i);
                        return Math.min(w, h) / 2;
                    })
                    .outerRadius(person.getR());

                // path attributes
                g.selectAll('path')
                    .attr("d", arc)
                    .attr("stroke", "#FFFFFF")
                    .attr("fill", function (d, i) { return d.data.color; })
            };

            // animate existing nodes
            setAttrs(allGs.transition(500));

            // create new container, but make it transparent.
            var newGs = allGs.enter().append('g')
                .attr('class', klass)
                .attr('opacity', 0.0);

            // new image in center
            newGs.append("image")
                .attr("xlink:href", person.getPic());

            // add the wedges around the image
            var pieLayout = d3.layout.pie()
                .sort(function(a, b) {
                    return a.weight - b.weight;
                })
                .startAngle(0)
                .endAngle(2*Math.PI)
                .value(function(d) {
                    return d.weight;
                });

            var personToWedges = function(d) {
                var wedges = [];
                for (var iid in d.relevance) {
                    if (iid != 'overall' && iid != -1) {
                        wedges.push({
                            weight :d.relevance[iid],
                            color : d.interestColors[iid],
                            id:iid
                        })
                    }
                }
                return pieLayout(wedges);
            };
            newGs.append("g")
                .attr('class','pie')
                .selectAll("path")
                .data(personToWedges)
                .enter()
                .append("path")
                .attr("id",function(d){
                    return 'path'+ d.data.id;
                });

            // create the label on the bottom of the person
            // TODO: make this animatible.
            var l = MC.label()
                .setText(person.getText())
                .setY(function (d, i) {
                    var r = person.getOrCallR(d, i);
                    return "" + (r+11) + "px";
                })
                .setAlign('middle');

            newGs.call(l);
            setAttrs(newGs);
            newGs.transition().duration(500).attr('opacity', 1.0);

            person.getOrCallOnHover().forEach(function (v) {
                allGs.on('mouseover', v[0]);
                allGs.on('mouseout', v[1]);
            });
        });
    }


    MC.options.register(person, 'text', function (d, i) { return d.name; });
    MC.options.register(person, 'pic', function (d, i) { return d.pic; });
    MC.options.register(person, 'cx', function (d) { return d.cx; });
    MC.options.register(person, 'cy', function (d) { return d.cy; });
    MC.options.register(person, 'imageWidth', 28);
    MC.options.register(person, 'imageHeight', 42);
    MC.options.register(person, 'r', 25);
    MC.options.register(person, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(person, 'cssClass', 'person');
    //    MC.options.register(person, 'interests', function (){throw('no interests specivied')});

    return person;
};
