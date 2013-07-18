var MC = (window.MC = (window.MC || {}));

/**
 * Adds a label to the current selection. Example invocation:
 *
 * var label = MC.label()
 *    .setText(function (d) { return d; })
 *
 * g.data(['foo', 'bar', 'baz'])
 *     .enter()
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
MC.label = function() {
    function label(g) {
        var g = g.append('g')
            .attr('class', label.getCssClass());

        var cleanedText = label.getText();
        if (cleanedText.length > 15){
            if(cleanedText.indexOf(" ") !== -1)
                cleanedText.replace(" ", "\n");
            else
                cleanedText.substr(0, 15) + "\n" + cleanedText.substr(15);
        }

        var t = g.append('text')
            .attr('x', label.getX())
            .attr('y', label.getY())
            .text(cleanedText)
            .attr('text-anchor', label.getAlign());

        label.getOnHover().forEach(
            function (v) {
                t.on('mouseover', v[0]);
                t.on('mouseout', v[1]);
            });

        return g;
    }

    MC.options.register(label, 'text', 'undefined');
    MC.options.register(label, 'x', 0);
    MC.options.register(label, 'y', '1em');
    MC.options.register(label, 'align', 'left');
    MC.options.register(label, 'cssClass', 'label');
    MC.options.register(label, 'onHover', [], MC.options.TYPE_LIST);

    return label;
};
