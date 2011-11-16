macademia.nbrviz.colors = macademia.nbrviz.colors || {
    map : null,
    hues : [0.01, 0.17, 0.29, 0.47, 0.68, 0.82],
    stack : [],
    COOKIE_NAME : 'viz_colors'
};

var NVC = macademia.nbrviz.colors;


NVC.assign = function(ids) {
    if (NVC.map == null) {
        NVC.map = NVC.loadColorsFromCookie();
    }
    if (!ids || !ids.length) {
        return;
    }
    if (ids.length > NVC.hues.length) {
        ids = ids.slice(0, NVC.hues.length); // ignore too many colors (for now)
    }
    ids = ids.sort(function (id1, id2) {
        return -1 * (NVC.stack.indexOf(id1) - NVC.stack.indexOf(id2));
    });
    // push ids to the top of the stack.
    $.each(ids, function (i, id) {
        i = NVC.stack.indexOf(id);
        if (i >= 0) { NVC.stack.splice(i, 1); }
        NVC.stack.push(id);
    });

    // all available colors
    var avail = {};
    $.each(NVC.hues, function (i, hue) { avail[hue] = -1; });

    // retain existing hues (track collisions)
    var collisions = [];
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var hue = NVC.map[id];
        if (hue in avail) {
            delete avail[hue];
        } else {
            collisions.push(id);
        }
    }

    // sort available hues by recency
    for (i = 0; i < NVC.stack.length; i++) {
        id = NVC.stack[i];
        hue = NVC.map[id];
        if (hue in avail) {
            avail[hue] = Math.max(avail[hue], i);
        }
    }
    var availList = $.map(avail, function(v, k) { return k; });
    availList.sort(function (hue1, hue2) {
        return avail[hue1] - avail[hue2];
    });

    // assign new hues
    if (collisions.length > availList.length) {
        alert('color assignemnt assertion failed!');
        return;
    }
    for (i = 0; i < collisions.length; i++) {
        id = collisions[i];
        hue = availList[i];
        NVC.map[id] = hue;
    }

    // save colors to cookie.
    NVC.saveColorsToCookie(NVC.map);
};


/**
 * Returns a hue (float between 0 and 1) that is persistent for the id.
 * Tries to space out hues so that they arent too close together. Hues
 * are persisted using a cookie.
 *
 * @param id
 */
NVC.getColor = function(id) {
    if (NVC.map == null) {
        alert('getColor assertion error: colors is null');
        return 0.0;
    }
    if (!(id in NVC.map)) {
        return 0.0;
    }
    return NVC.map[id];
};

/**
 * Returns a mapping from ids to hues.
 */

NVC.loadColorsFromCookie = function() {
    var cookieVal = macademia.getCookie(NVC.COOKIE_NAME);
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

NVC.saveColorsToCookie = function(colors) {
    var tokens = [];
    $.each(colors, function(id, hue) {
        tokens.push(id + '_' + hue);
    });
    macademia.setCookie(NVC.COOKIE_NAME, tokens.join(','), 10);
};
