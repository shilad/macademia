var MC = (window.MC = (window.MC || {}));


/**
 * Returns the "untransformed" Cartesian x,y coordinates for a particular
 * x, y coordinates under the transformation associated with some SVG shape.
 *
 * @param svg The parent svg container whose coordinate space we will use for the result.
 * @param shape The shape whose transformation matrix the input coordinates appear in.
 * @param x The input (transformed) x coordinate
 * @param y The input (transformed) y coordinate
 * @return {*} The output point in the new coordinate space.
 */
MC.getTransformedPosition = function(svg, shape, x, y) {
    var matrix = shape.getCTM();
    console.log(shape);
    // transform a point using the transformed matrix
    var position = svg.createSVGPoint();
//    console.log(position);
//    console.log(matrix);
    position.x = x;
    position.y = y;
    return position.matrixTransform(matrix);
};

/**
 * Converts a hue to a d3 color.
 * @param h Hue in [0,1]
 * @return {*} D3 color.
 */
MC.hueToColor = function(h) {
//    console.log(h);
    return d3.hsl(h * 359, 0.8, 0.8);
};

/**
 * Capitalizes the first letter of a string.
 * @param string
 * @return {String}
 */
MC.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

MC.options = {
    TYPE_NORMAL : 0,
    TYPE_LIST : 1
};




/**
 * Register getter / setter objects for a particular object.
 * If type is TYPE_NORMAL three options are created.
 *
 * For example, if name is 'foo':
 *  "getFoo": return the value provided to setFoo.
 *  "getOrCallFoo": Get the value of foo. If it is a callback, call it with the passed-in arguments.
 *  "setFoo": Set the value of foo.
 *
 * If type is TYPE_LIST, setFoo is replaced with addFoo, and getFoo returns the list of all foos added.
 *
 *
 * @param obj The object the getters and setters are being created in.
 * @param name The name of the attribute
 * @param default_value The default value for the attribute
 * @param type TYPE_NORMAL or TYPE_LIST, defaults to NORMAL.
 */

MC.options.register = function (obj, name, default_value, type) {
    obj.__nz_opts = obj.__nz_opts || {};
    obj.__nz_opts[name] = default_value;

    var cname = MC.capitalize(name);

    obj['getOrCall' + cname] = function() {
        var val = obj.__nz_opts[name];
        if (val != null && val.call) {
            return val.apply(val, arguments);
        } else {
            return val;
        }
    };

    obj['get' + cname] = function() {
        return obj.__nz_opts[name];
    };

    obj['set' + cname] = function() {
        if (type == MC.options.TYPE_LIST) {
            throw ('must call add' + cname + ' for list types');
        }
        if (arguments.length == 1) {
            obj.__nz_opts[name] = arguments[0];
        } else {
            obj.__nz_opts[name] = arguments;
        }
        return this;
    };

    obj['add' + cname] = function() {
        if (type != MC.options.TYPE_LIST) {
            throw ('add' + cname + ' only available for list types');
        }
        if (arguments.length == 1) {
            obj.__nz_opts[name].push(arguments[0]);
        } else {
            obj.__nz_opts[name].push(arguments);
        }
        return this;
    };
};
