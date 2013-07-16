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
MC.interestZ = function() {
    function interest(selection) {
        selection.each(function(data) {
            var klass = interest.getCssClass();

            var allGs = d3.select(this).selectAll("g." + klass).data(data, function (d) { return d.id; });

            // setup g with circle and label for new elements.
            // Set the initial opacity to 0. You will want to change this through a transition.
            var newGs = allGs.enter().append('g')
                .attr('class', klass)
                .attr('opacity', 0.0);

            allGs.exit().remove();


            newGs.append('circle');
            var l = MC.label()
                .setText(interest.getText())
                .setAlign('middle');
            newGs.call(l);

            allGs.transition()
                .attr('opacity', 1.0)
                .duration(1000);

            // position both existing and new elements.
            allGs.attr('transform', function (d, i) {
                    var cx = interest.getOrCallCx(d, i);
                    var cy = interest.getOrCallCy(d, i);
                    return 'translate(' + cx + ', ' + cy + ')';
                });

            // Change fill for both existing and new elements
            allGs.select('circle')
                    .attr('fill', interest.getColor())
                    .attr('r', interest.getR());

//            interest.getOrCallOnHover().forEach(function (v) {
//                    g.on('mouseover', v[0]);
//                    g.on('mouseout', v[1]);
//                });
        });
    }

    MC.options.register(interest, 'text', function (d) { return d.name; });
    MC.options.register(interest, 'color', function (d) { return MC.hueToColor(d.color); })
    MC.options.register(interest, 'cx', function (d) { return d.cx; });
    MC.options.register(interest, 'cy', function (d) { return d.cy; });
    MC.options.register(interest, 'r', function(d) { return d.r; });
    MC.options.register(interest, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(interest, 'cssClass', 'interest');
    MC.options.register(interest, 'enterTransition', function() { return this.attr('opacity', 1.0); });
    MC.options.register(interest, 'updateTransition', null);
    MC.options.register(interest, 'exitTransition', null);

    return interest;
};
