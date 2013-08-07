var MC = (window.MC = (window.MC || {}));

/**
 *
 * Adds two circles, one that has color and one that is just a white rimed circle inside the other.
 * The circles have a label corresponding to an interest.
 *
 * An interest MUST be an object with fields:
 * id, name
 *
 * Example usage:
 *
 * var interests = {
        3: {"id": 3, "name": "Louisville"},
        53: {"id": 53, "name": "Cardinal"},
        63: {"id": 63, "name": "Basketball"}
    };
 *
 * var interest = MC.interest()
 *
    d3.select('svg')
        .attr('width', 500)
        .attr('height', 500)
        .datum(interests1)
        .call(interest);
 *
 * Available attributes:
 *      text: text of the label
 *      cx: center x position
 *      cy: center y position
 *      align: text align, one of (left, middle, right)
 *      cssClass: class for <g> enclosing the label
 *      onHover: A list option that takes two parameters.
 *               The first is called on mouse in, the second on mouse out.
 *               Both function take two arguments: the interest and key.
 *      color: color of the interest node
 *      r : the radius of the interest node
 *      rInner: the radius of the white ring in the interest node
 *      opacity: how opaque the interest node is
        cleanedText:  Takes in an object and extracts a name.
                If the name is greater than 15 in length it appears on the display
                as 10 in length with a "..."

 * @return {Function}
 */
MC.interest = function() {
    function interest(selection) {

        selection.each(function(data) {
            var klass = interest.getCssClass();

            var allGs = d3.select(this)
                .selectAll("g." + klass)
                .data(data, function (d) { return d.id; });

            // setup g with circle and label for new elements.
            // Set the initial opacity to 0. You will want to change this through a transition.
            var newGs = allGs.enter().append('g')
                .attr('class', klass)
                .attr('opacity', 0.0);

            //fades out out dated g's
            if(allGs.exit().size() > 0){
                allGs.exit().transition().attr('opacity', 0.0).remove();
            }

//            console.log('allGs size is ' + newGs.size());

            newGs.append('circle').attr('class',klass+"Outer"); //Outer circle
            newGs.append('circle').attr('class',klass+"Inner"); //inner circle
            var l = MC.label()
                .setText(interest.getLabelText())
                .setY(function (d, i) {
                    var r = interest.getOrCallR(d, i);
                    return "" + (r+11) + "px";
                })
                .setAlign('middle');
            newGs.call(l);

            // position both existing and new elements.
//            allGs.transition()
//                .duration(200)
//                .attr('transform', function (d, i) {
//                    var cx = interest.getOrCallCx(d, i);
//                    var cy = interest.getOrCallCy(d, i);
//                    return 'translate(' + cx + ', ' + cy + ')';
//                })
//                .transition()
////                .delay(200)
//                .attr('opacity', 1.0)
//                .duration(100);
            allGs
                .attr('transform', function (d, i) {
                    var cx = interest.getOrCallCx(d, i);
                    var cy = interest.getOrCallCy(d, i);
                    return 'translate(' + cx + ', ' + cy + ')';
                })
                .attr('opacity', 1.0);

            // Change fill for both existing and new elements
            allGs.select('circle.'+klass+"Inner")
                .attr('fill', 'none')
                .attr('stroke','white')
                .attr('stroke-width',1)
                .attr('r', interest.getRInner());

            allGs.select('circle.'+klass+"Outer")
                .attr('fill', interest.getColor())
                .attr('r', interest.getR());

//            interest.getOrCallOnHover().forEach(function (v) {
//                    g.on('mouseover', v[0]);
//                    g.on('mouseout', v[1]);
//                });
        });
    }

    MC.options.register(interest, 'text', function (d) {
        if(d[0]){ //if it is a hub
            return d[0].name;
        }
        return d.name;
    });
    MC.options.register(interest, 'htmlText', function (d) {
        if(d.name.length<15){
            return d.name;
        }
        else{
            if(d.name.indexOf(' ')>=0){
                return d.name.replace(' ',"<br/>");
            }
            else{
                return d.name.substr(0,10)+"<br/>"+ d.name.substr(10, d.name.length);
            }

        }
    });
    MC.options.register(interest, 'cleanedText', function (d) {
        var cleanedText;
        if(d[0]){
            cleanedText=d[0].name;
        }
        else{
            cleanedText = d.name;
        }

//        console.log(d);
//        console.log(d.name);

        if (cleanedText.length > 15){
             cleanedText = cleanedText.substr(0, 10) + " ...";
        }
//        console.log(cleanedText);
        return cleanedText;
    });
    MC.options.register(interest, 'color', function (d) { return d.color; })
    MC.options.register(interest, 'cx', function (d,i) { return d.cx; });
    MC.options.register(interest, 'cy', function (d,i) { return d.cy; });
    MC.options.register(interest, 'r', function(d) { return d.r || 10; });
    MC.options.register(interest, 'rInner', function(d) { return (d.r|| 10) *0.85; }); //get the radius of the inner circle
    MC.options.register(interest, 'opacity', 1.0);
    MC.options.register(interest, 'onHover', [], MC.options.TYPE_LIST);
    MC.options.register(interest, 'cssClass', 'interest');
    MC.options.register(interest, 'labelText',interest.getCleanedText())
//    MC.options.register(interest, 'enterTransition', function() { return this.attr('opacity', 1.0); });
//    MC.options.register(interest, 'updateTransition', null);
    MC.options.register(interest, 'exitTransition', null);

    return interest;
};