var NZ = (window.NZ = (window.NZ || {}));

/**
 * Adds a label to the current selection. Example invocation:
 *
 * var label = NZ.label()
 *    .setText(function (d) { return d; })
 *
 * g.data(['foo', 'bar', 'baz'])
 *     .call(label);
 *
 * Available attributes:
 *      text: text of the label
 *      x: x position
 *      y: y position
 *      align: text align, one of (left, middle, right)
 *      cssClass: class for <g> enclosing the label
 *      onHover: A list option that takes two parameters.
 *               The first is called on mouse in, the second on mouse out.
 *               Both function take two arguments: the d3 data and key.
 *
 * TODO:
 * - handle multiline labels.
 * - add "..." option for long labels that reveals full text on mouseover.
 *
 * @return {Function}
 */
NZ.label = function() {
    function label(g) {

        var g = g.append('g')
            .attr('class', label.getCssClass());

        var t = g.append('text')
            .attr('x', label.getX())
            .attr('y', label.getY())
            .text(label.getText())
            .attr('text-anchor', label.getAlign());

        label.getOnHover().forEach(
            function (v) {
                t.on('mouseover', v[0]);
                t.on('mouseout', v[1]);
            });

        return g;
    }

    NZ.options.register(label, 'text', 'undefined');
    NZ.options.register(label, 'x', 0);
    NZ.options.register(label, 'y', '1em');
    NZ.options.register(label, 'align', 'left');
    NZ.options.register(label, 'cssClass', 'label');
    NZ.options.register(label, 'onHover', [], NZ.options.TYPE_LIST);

    return label;
};
