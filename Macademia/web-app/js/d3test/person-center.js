var MC = (window.MC = (window.MC || {}));


MC.personCenter = function() {

    function personCenter(g) {

        var g = g.append('g')
            .attr('class', personCenter.getCssClass())
            .attr('transform', function (d, i) {
                var cx = personCenter.getOrCallCx(d, i);
                var cy = personCenter.getOrCallCy(d, i);
                return 'translate(' + cx + ', ' + cy + ')';
            });

        var c = g.append('circle')
            .attr('fill', 'gray')
            .attr('r',55);

        var img = g.append("image")
            .attr("xlink:href", personCenter.getPic())
            .attr("height", personCenter.getImageHeight())
            .attr("width", personCenter.getImageWidth())
            .attr("transform", function (d, i) {
                var w = personCenter.getOrCallImageWidth(d, i);
                var h = personCenter.getOrCallImageHeight(d, i);
                return 'translate(-' + (w/2) + ', -' + (h/1.5) + ')';
            });



        personCenter.getOrCallOnHover().forEach(function (v) {
            g.on('mouseover', v[0]);
            g.on('mouseout', v[1]);
        });

        var l = MC.label()
            .setText(personCenter.getText())
            .setY(function (d, i) {
                var r = personCenter.getOrCallR(d, i);
                return "" + (r+11) + "px";
            })
            .setAlign('middle');

        g.call(l);

        return g;
    }

    MC.options.register(personCenter, 'text', function (d, i) { return d.name; });
    MC.options.register(personCenter, 'pic', function (d, i) { return d.pic; });
    MC.options.register(personCenter, 'cx', 100);
    MC.options.register(personCenter, 'cy', 100);
    MC.options.register(personCenter, 'imageWidth', 40);
    MC.options.register(personCenter, 'imageHeight', 80);
    MC.options.register(personCenter, 'r', 25);
    MC.options.register(personCenter, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(personCenter, 'cssClass', 'person');

    return personCenter;
};
