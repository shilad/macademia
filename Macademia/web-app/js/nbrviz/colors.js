macademia.nbrviz.colors = macademia.nbrviz.colors || null;


/**
 * Returns a hue (float between 0 and 1) that is persistent for the id.
 * Tries to space out hues so that they arent too close together. Hues
 * are persisted using a cookie.
 *
 * @param id
 */
macademia.nbrviz.getColor = function(id) {
    if (macademia.nbrviz.colors == null) {
        macademia.nbrviz.colors = macademia.nbrviz.loadColorsFromCookie();
    }
    if (id in macademia.nbrviz.colors) {
        return macademia.nbrviz.colors[id];
    }

    var current = macademia.nbrviz.colors;
    var hue;
    if ($.isEmptyObject(current)) {
        hue = 0.333;
    } else {
        var allHues = $.map(current, function (hue, id) { return parseFloat(hue); });
        allHues.sort(function(x, y) { return x - y });

        // Initialize based on hue preceeding first hue (may be near 0 or 1.0)
        var maxDistance = 1 + allHues[0] - allHues[allHues.length-1];
        hue = allHues[0] - maxDistance / 2;
        if (hue < 0) { hue += 1.0; }

        for (var i = 1; i < allHues.length; i++) {
            var d = allHues[i] - allHues[i-1];
            if (d > maxDistance) {
                maxDistance = d;
                hue = allHues[i-1] + d / 2;
            }
        }
    }
    current[id] = hue;
    macademia.nbrviz.saveColorsToCookie(current);
    return hue;
};

/**
 * Returns a mapping from ids to hues.
 */

macademia.nbrviz.loadColorsFromCookie = function() {
    var cookieVal = macademia.getCookie("nbrviz_colors");
    if (!cookieVal) {
        return {};
    }
    var pairs = cookieVal.split(',');
    var colors = {};
    $.each(pairs, function (i, p) {
        var tokens = p.split('_');
        colors[tokens[0]] = parseFloat(tokens[1]);
    });
    return colors;
};

macademia.nbrviz.saveColorsToCookie = function(colors) {
    var tokens = [];
    $.each(colors, function(id, hue) {
        tokens.push(id + '_' + hue);
    });
    macademia.setCookie("nbrviz_colors", tokens.join(','), 10);
};
