macademia.nbrviz.colors = macademia.nbrviz.colors || null;
macademia.nbrviz.colorStack = [];
macademia.nbrviz.COLOR_COOKIE_NAME = 'viz_colors';
macademia.nbrviz.COLOR_PADDING = 0.15;
var NVZ = macademia.nbrviz;


NVZ.assignColors = function(ids) {
    if (!ids || !ids.length) {
        return;
    }
    ids = ids.sort(function (id1, id2) {
        return -1 * (NVZ.colorStack.indexOf(id1) - NVZ.colorStack.indexOf(id2));
    });
    // push ids to the top of the stack.
    $.each(ids, function (i, id) {
        i = NVZ.colorStack.indexOf(id);
        if (i >= 0) { NVZ.colorStack.splice(i, 1); }
        NVZ.colorStack.push(id);
    });
    $.each(ids, function (i, id) {
        NVZ.ensureColorIsAssigned(id, ids.slice(0, i), ids);
    });
};

/**
 * Returns a hue (float between 0 and 1) that is persistent for the id.
 * Tries to space out hues so that they arent too close together. Hues
 * are persisted using a cookie.
 *
 * @param id
 */
NVZ.ensureColorIsAssigned = function(id, assignedIds, displayedIds) {
    if (NVZ.colors == null) {
        NVZ.colors = NVZ.loadColorsFromCookie();
    }


    var current = NVZ.colors;
    var hue = null;
    if (id in NVZ.colors) {
        hue = NVZ.colors[id];
        for (var i = 0; i < assignedIds.length; i++) {
            var id2 = assignedIds[i];
            var d = Math.abs(hue - current[id2]);
            d = Math.min(d, 1.0 - d);   // accommodate wrapping.
            if (d < NVZ.COLOR_PADDING) {
                hue = null;
                break;
            }
        }
    }

    if (hue != null) {
        // all set!
    } else if ($.isEmptyObject(current)) {
        hue = 0.333;
    } else {

        // order hues, remember first and last
        var allHues = $.map(current, function (hue, id2) { return parseFloat(hue); });
        allHues.sort(function(x, y) { return x - y });
        var firstHue = allHues[0];
        var lastHue = allHues[allHues.length - 1];

        // construct intervals between hues (first hue is negative)
        var intervals = [[lastHue - 1.0, firstHue]];
        for (var i = 0; i < allHues.length-1; i++) {
            intervals.push([allHues[i], allHues[i+1]]);
        }

        // currentHues will contain true current hues,
        // plus "fake" hues < 0 and > 1 for hues close to end points.
        var currentHues = $.map(displayedIds, function (id2) {
            if (!(id2 in current)) {
                return null;
            }
            var h = current[id2];
            var expanded = [h];
            if (h < NVZ.COLOR_PADDING) {
                expanded.push(1.0 + h);
            } else if (h > 1.0 - NVZ.COLOR_PADDING) {
                expanded.push(h - 1.0);
            }
            return expanded;
        });

        $.each(currentHues, function(index, h) {
            for (var i = 0; i < intervals.length;) {
                var overlapsStart = Math.abs(h - intervals[i][0]) < NVZ.COLOR_PADDING;
                var overlapsEnd = Math.abs(h - intervals[i][1]) < NVZ.COLOR_PADDING;
                if (overlapsStart && overlapsEnd) {
                    intervals.splice(i, 1); // remove it
                } else if (overlapsStart) {
                     intervals[i][0] = h + NVZ.COLOR_PADDING; // bump beginning
                    i += 1;
                } else if (overlapsEnd) {
                    intervals[i][1] = h - NVZ.COLOR_PADDING; // bump end
                    i += 1;
                } else {
                    i += 1;     // in the clear
                }
            }
        });

        // if there are no intervals left, try again without one of the current ids
        if (!intervals.length) {
            return NVZ.ensureColorIsAssigned(id, assignedIds.slice(1), displayedIds.slice(1));
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
    console.log('assigned color ' + id + ' value ' + hue);
    NVZ.saveColorsToCookie(current);
    return hue;

};

/**
 * Returns a hue (float between 0 and 1) that is persistent for the id.
 * Tries to space out hues so that they arent too close together. Hues
 * are persisted using a cookie.
 *
 * @param id
 */
NVZ.getColor = function(id) {
    if (NVZ.colors == null) {
        alert('getColor assertion error: colors is null');
        return 0.0;
    }
    if (!(id in NVZ.colors)) {
        return 0.0;
    }
    return NVZ.colors[id];
};

/**
 * Returns a mapping from ids to hues.
 */

NVZ.loadColorsFromCookie = function() {
    var cookieVal = macademia.getCookie(NVZ.COLOR_COOKIE_NAME);
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

NVZ.saveColorsToCookie = function(colors) {
    var tokens = [];
    $.each(colors, function(id, hue) {
        tokens.push(id + '_' + hue);
    });
    macademia.setCookie(NVZ.COLOR_COOKIE_NAME, tokens.join(','), 10);
};
