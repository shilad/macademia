var MC = (window.MC = (window.MC || {}));

/**
 * Hacks abound!
 *
 * @param visExport
 * @param opts
 */
MC.createAccessors = function(visExport, opts) {
    for (var n in opts) {
        if (!opts.hasOwnProperty(n)) continue;
        var isArray = opts[n] instanceof Array;

        visExport[n] = (function(n) {
            if (isArray) {    // hack to handle multiple event bindings!
                return function () {
                    console.log(arguments)
                    if (arguments.length == 1) {
                        return this.on(n);  // what is "this"? probably broken!
                    } else {
                        opts.on.push(arguments);
                        return this;
                    }
                }
            } else {
                return function() {
                    if (arguments.length == 0) {
                        return opts[n];
                    } else if (arguments.length == 1) {
                        opts[n] = arguments[0];
                        return this;
                    } else {
                        opts[n] = arguments;
                        return this;
                    }
                }
            }
        })(n);
    }
};

MC.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

MC.options = {
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

    register : function (obj, name, default_value, type) {
        obj.__nz_opts = obj.__nz_opts || {};
        obj.__nz_opts[name] = default_value;

        var cname = MC.capitalize(name);

        obj['getOrCall' + cname] = function() {
            var val = obj.__nz_opts[name];
            if (val.call) {
                return val.call.apply(val, arguments);
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
    },
    TYPE_NORMAL : 0,
    TYPE_LIST : 1
};
