/**
 * A web-worker designed to move the calculation of the
 * visualizations layout into a separate thread.
 */

var iters = 0;
var k;
var points;
var magnets;

// is the main thread ready for the next update?
var readyNext;
// is the layout computation completed?
var done = false;

var pendingUpdates = [];

// Imported scripts parameters are evaluated left to right.
importScripts("magnet.js", "vector.js");

function layout() {
    k = 1.0;
    var n = Math.min(5, 1 + iters / 7);
    for (var i = 0; i < n; i++) {
        k = Math.min(k, magnet.oneLayoutIteration(points, magnets));
    }

    pendingUpdates.push(Point.pointsToJSON(points));
    
    if (iters++ < 23 && k >= 0.00001) {
        layout();
    } else {
        done = true;
    }
}

// Send updates when main thread signals it is ready
function update() {
    if (readyNext && pendingUpdates.length > 0) {
        self.postMessage(JSON.stringify({
            message : "updatePeoplePositions",
            args : { points: pendingUpdates.shift() }
        }));
        readyNext = false;
    }
    if (!done || pendingUpdates.length > 0) {
        setTimeout(update, 10);
    } else {
        self.postMessage(JSON.stringify({
            message : "done",
            args : { iters: iters, k: k }
        }));
    }
}

self.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var args = data.args;
    if (data.message == "points") {
        points = Point.makePointsFromJSON(args.points);
    } else if (data.message == "magnets") {
        magnets = Magnet.makeMagnetsFromJSON(args.magnets);
    } else if (data.message == "initMagnet") {
        // need to reset constants where the web-worker can see them.
        magnet.init(args.width, args.height);
    } else if (data.message == "start") {
        if (points && magnets) {
            readyNext = true;
            update();
            layout();
        }
    } else if (data.message == "ready") {
        readyNext = true;
    }
};
