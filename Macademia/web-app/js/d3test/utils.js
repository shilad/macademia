var MC = (window.MC = (window.MC || {}));


MC.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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
};
