/**
 * A web-worker designed to move the calculation of the
 * visualizations layout into a separate thread.
 */

var iters = 0;
var points;
var magnets;

// Imported scripts parameters are evaluated left to right.
importScripts("magnet.js", "vector.js");

function layout() {
    var k = 1.0;
    var n = Math.min(5, 1 + iters / 7);
    for (var i = 0; i < n; i++) {
        k = Math.min(k, magnet.oneLayoutIteration(points, magnets));
    }
    self.postMessage(JSON.stringify({
                message : "updatePeoplePositions",
                args : { points: Point.pointsToJSON(points) }
    }));
    if (iters++ < 23 && k >= 0.00001) {
        setTimeout(layout, 150);
    } else {
        self.postMessage(JSON.stringify({
                    message: "done",
                    args: { iters : iters, k : k }
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
            layout();
        }
    }
};
