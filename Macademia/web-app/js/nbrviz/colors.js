macademia.nbrviz.colors = macademia.nbrviz.colors || null;


/**
 * Returns a hue (float between 0 and 1) that is persistent for the id.
 * Tries to space out hues so that they arent too close together. Hues
 * are persisted using a cookie.
 *
 * @param id
 */
macademia.nbrviz.getColor = function(id, currentIds) {
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

        // order hues, remember first and last
        var allHues = $.map(current, function (hue, id) { return parseFloat(hue); });
        allHues.sort(function(x, y) { return x - y });
        var firstHue = allHues[0];
        var lastHue = allHues[allHues.length - 1];

        // construct intervals between hues (first hue is negative)
        var intervals = [[lastHue - 1.0, firstHue]];
        for (var i = 0; i < allHues.length-1; i++) {
            intervals.push([allHues[i], allHues[i+1]]);
        }

        var SPACE = 0.15;

        // currentHues will contain true current hues,
        // plus "fake" hues < 0 and > 1 for hues close to end points.
        var currentHues = $.map(currentIds, function (id) {
            if (!(id in current)) {
                return null;
            }
            var h = current[id];
            var expanded = [h];
            if (h < SPACE) {
                expanded.push(1.0 + h);
            } else if (h > 1.0 - SPACE) {
                expanded.push(h - 1.0);
            }
            return expanded;
        });

        $.each(currentHues, function(index, h) {
            for (var i = 0; i < intervals.length;) {
                var overlapsStart = Math.abs(h - intervals[i][0]) < SPACE;
                var overlapsEnd = Math.abs(h - intervals[i][1]) < SPACE;
                if (overlapsStart && overlapsEnd) {
                    intervals.splice(i, 1); // remove it
                } else if (overlapsStart) {
                     intervals[i][0] = h + SPACE; // bump beginning
                    i += 1;
                } else if (overlapsEnd) {
                    intervals[i][1] = h - SPACE; // bump end
                    i += 1;
                } else {
                    i += 1;     // in the clear
                }
            }
        });

        // if there are no intervals left, try again without one of the current ids
        if (!intervals.length) {
            return macademia.nbrviz.getColor(id, currentIds.slice(1));
        }

        // Initialize based on hue preceeding first hue (may be near 0 or 1.0)
        var biggestInterval = -1;
        hue = 0.33;

        // find the best hue.
        $.each(intervals, function(i, interval) {
            if (interval[1] - interval[0] > biggestInterval) {
                hue = (interval[1] + interval[0]) / 2.0;
                biggestInterval = interval[1] - interval[0];
            }
        });
        console.log('\tchose ' + hue);

        // might happen if we pick a hue in the first interval (first hue is negative)
        if (hue < 0) { hue += 1; }

        // should never happen if we have at least one interval
        if (biggestInterval < 0) {
            alert('error in colors, will rodgers!');
        }
    }
    current[id] = hue;
    macademia.nbrviz.saveColorsToCookie(current);
    return hue;
};

macademia.nbrviz.COLOR_COOKIE_NAME = 'viz_colors';

/**
 * Returns a mapping from ids to hues.
 */

macademia.nbrviz.loadColorsFromCookie = function() {
    var cookieVal = macademia.getCookie(macademia.nbrviz.COLOR_COOKIE_NAME);
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
    macademia.setCookie(macademia.nbrviz.COLOR_COOKIE_NAME, tokens.join(','), 10);
};
