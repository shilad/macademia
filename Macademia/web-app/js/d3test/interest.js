var MC = (window.MC = (window.MC || {}));

/**
 * Adds a single circle with a label corresponding to an interest.
 * An interest must be an object with fields:
 * id, name, and color (actually a hue in [0,1]).
 *
 * Example usage:
 *
 * var interests = [
 *      {'name' : 'Rock climbing', 'color' : 0.3},
 *      {'name' : 'Squash', 'color' : 0.7}
 * ];
 *
 * var interest = MC.interest()
 *    .setCx(343)
 *    .setR(function (d) { return d.name.length() / 5; };
 *
 * g.data(interests)
 *     .enter()
 *     .call(interest);
 *
 * Available attributes:
 *      text: text of the label
 *      cx: center x position
 *      cy: center y position
 *      r: radius of interest circle
 *      align: text align, one of (left, middle, right)
 *      cssClass: class for <g> enclosing the label
 *      onHover: A list option that takes two parameters.
 *               The first is called on mouse in, the second on mouse out.
 *               Both function take two arguments: the interest and key.
 *
 * @return {Function}
 */
MC.interest = function() {
    function interest(g) {
        console.log(g);

        var g = g.append('g')
            .attr('class', interest.getCssClass())
            .attr('transform', function (d, i) {
                var cx = interest.getOrCallCx(d, i);
                var cy = interest.getOrCallCy(d, i);
                return 'translate(' + cx + ', ' + cy + ')';
            });

        var c = g.append('circle')
                .attr('fill', function (d) { return MC.hueToColor(d.color); })
                .attr('r', interest.getR());

        interest.getOrCallOnHover().forEach(function (v) {
                g.on('mouseover', v[0]);
                g.on('mouseout', v[1]);
            });

        var l = MC.label()
            .setText(interest.getText())
            .setAlign('middle');

        g.call(l);

        return g;
    }

    MC.options.register(interest, 'text', function (d) { return d.name; });
    MC.options.register(interest, 'cx', 100);
    MC.options.register(interest, 'cy', 100);
    MC.options.register(interest, 'r', 10);
    MC.options.register(interest, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(interest, 'cssClass', 'interest');

    return interest;
};
