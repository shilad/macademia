var MC = (window.MC = (window.MC || {}));

/**
 * Adds a label to the current selection. Example invocation:
 *
 * var label = MC.label()
 *    .setText(function (d) { return d; })
 *
 * g.datum(['foo', 'bar', 'baz'])
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
    function label(selection) {
        selection.each(function(data) {
            // HACK! how to fix this?
            if (!(data instanceof Array)) {
                data = [data];
            }
            var klass = label.getCssClass();

            var setAttrs = function(g) {
                g.attr('x', label.getX())
                  .attr('y', label.getY())
                  .text(label.getText())
                  .attr('text-anchor', label.getAlign())
            };

            var allGs = d3.select(this)
                .selectAll("g." + klass)
                .data(data);

            //fades out out dated g's
            if(allGs.exit().size() > 0){
                allGs.exit().transition().attr('opacity', 0.0).remove();
            }

            setAttrs(allGs.transition());

            var newGs = allGs.enter()
                .append('g')
                .attr('class', label.getCssClass())
                .append('text');

            setAttrs(newGs);
        });
    }

    MC.options.register(label, 'text', function (d) { return d.text; });
    MC.options.register(label, 'x', function (d) { return d.x; });
    MC.options.register(label, 'y', function (d) { return d.y; });
    MC.options.register(label, 'align', 'left');
    MC.options.register(label, 'cssClass', 'label');
    MC.options.register(label, 'onHover', [], MC.options.TYPE_LIST);

    return label;
};
