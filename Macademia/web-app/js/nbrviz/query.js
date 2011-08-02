/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.initQueryViz = function(vizJson) {
    var paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());

    // create related interests
    var clusterColors = {};
    var relatedInterests = {};
    var relatedInterestsById = {};
    $.each(vizJson.queries, function (i, id) {
        clusterColors[id] = 1.0 * i / vizJson.queries.length + 1.0 / vizJson.queries.length / 2;
        relatedInterests[id] = [];
        vizJson.interests[id].cluster = id;  // work around omission from json service...
    });
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info.cluster && info.cluster >= 0);
        var color = -0.7;
        if (hasCluster) {
            color = clusterColors[info.cluster];
        }
        var ri = new Interest({id:id, name:info.name, color:color});
        relatedInterestsById[id] = ri;
        if (hasCluster) {
            relatedInterests[info.cluster].push(ri);
        }
    });

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, id) {
        var info = vizJson.interests[id];
        var ic = new InterestCluster({
            relatedInterests : relatedInterests[id],
            name : info.name,
            color : clusterColors[id]
        });
        queryInterests[id] = ic;
    });

    // Create people
    // TODO: incorporate interest similarity scores
    var people = [];
    $.each(vizJson.people, function(id, pinfo) {
        var pinterests = [];
        var pnrinterests = [];
        $.each(pinfo.interests, function(i, id) {
            var iinfo = vizJson.interests[id];
            if (id in queryInterests) {
                pinterests.push(relatedInterestsById[id]);
            } else if (iinfo.cluster && iinfo.cluster >= 0) {
                pinterests.push(relatedInterestsById[id]);
            } else {
                pnrinterests.push(relatedInterestsById[id]);
            }
        });
        var totalRelevance = 0.0;
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall') {totalRelevance += weight;}
        });
        var interestGroups = [];
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall' && weight > 0) {
                interestGroups.push([
                    queryInterests[id],
                    1.0 * weight / totalRelevance
                ]);
            }
        });
        var person = new Person({
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : pinterests ,
            nonRelevantInterests : pnrinterests,
            strokeWidth : pinfo.relevance.overall * 20 / .2
        });
        people.push(person);
    });

    var qv = new QueryViz({
        people : people,
        queryInterests : $.map(queryInterests, function(v, k) {return v;}),
        paper : paper
    });
    qv.layoutInterests();
    qv.layoutPeople();
    qv.setupListeners();
};

/**
 * Construct a new query-based visualization.
 * @param params - An object with the following keys and values:
 * people: A list of
 */
function QueryViz(params) {
    this.people = params.people;
    this.queryInterests = params.queryInterests;
    this.paper = params.paper;
    this.focus = null;          // the current focus of the visualization

    // Set up the transparency filter
    this.fadeScreen = this.paper.rect(0, 0, this.paper.width, this.paper.height);
    this.fadeScreen.attr({ fill : 'white' , opacity : 0.0, 'stroke-width' : 0});

}

QueryViz.prototype.setupListeners = function() {
    // Set up the event listeners
    var self = this;
    $.each(this.people, function (index, p) {
        p.hover(
                function () { self.handlePersonHover(p); },
                function () { self.handlePersonUnhover(p); }
            );
    });
    $.each(this.queryInterests, function (index, i) {
        i.hover(
                function () { self.handleInterestHover(i); },
                function () { self.handleInterestUnhover(i); }
            );
//        i.hoverInterest(
//                function () { console.log('mouse in.'); },
//                function () { console.log('mouse out.'); }
//            );
    });
};

QueryViz.prototype.layoutInterests = function() {
    $.each(this.queryInterests, function(index, interestCluster) {
        var xRand = Math.floor( Math.random() * ($(document).width() - 120) ) + 60;
        var yRand = Math.floor( Math.random() * ($(document).height() - 120) ) + 60;
        interestCluster.setPosition(xRand, yRand);
    });

};

QueryViz.prototype.layoutPeople = function() {
    $.each(this.people, function(i, person) {
        var xRand = Math.floor( Math.random() * ($(document).width() - 120) ) + 60;
        var yRand = Math.floor( Math.random() * ($(document).height() - 120) ) + 60;

        // TODO: fixme: why would this ever not be true?
        if (person.interestGroups.length > 0) {
            person.setPosition(xRand, yRand);
        }
    });
};

QueryViz.prototype.raiseScreen = function(focus) {
    this.fadeScreen.stop();
    this.fadeScreen.insertBefore(focus);
    this.fadeScreen.animate({opacity : 0.85}, 400);
};

QueryViz.prototype.lowerScreen = function() {
    this.fadeScreen.stop();
    var self = this;
    this.fadeScreen.animate({opacity : 0.0}, 200, function () {self.fadeScreen.toBack();});
};

QueryViz.prototype.handlePersonHover = function(person) {
    person.toFront();
    this.raiseScreen(person.getBottomLayer());
};

QueryViz.prototype.handlePersonUnhover = function(person) {
    this.lowerScreen();
};

QueryViz.prototype.handleInterestHover = function(interest) {
    interest.toFront();
    this.raiseScreen(interest.getBottomLayer());
};

QueryViz.prototype.handleInterestUnhover = function(interest) {
    this.lowerScreen();
};
