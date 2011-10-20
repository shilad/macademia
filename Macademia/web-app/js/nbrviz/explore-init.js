macademia.nbrviz.explore = {};
macademia.nbrviz.explore.queryWeights = {};

macademia.nbrviz.explore.isInterestGraph = function() {
    return $.address.parameter('interestId');
};

macademia.nbrviz.explore.isPersonGraph = function() {
    return $.address.parameter('personId');
};

macademia.nbrviz.explore.recenter = function(klass, rootId) {
    var name = macademia.nbrviz.explore.interests[rootId].name;
    macademia.nbrviz.explore.loadingMessage = 're-centering around "' + name + '"...';
    $.address.autoUpdate(false);
    $.address.parameter('interestId', null);
    $.address.parameter('personId', null);
    $.address.parameter(klass + 'Id', rootId);
    $.address.autoUpdate(true);
    $.address.update();
};

macademia.nbrviz.explore.initQueryKey = function(vizJson) {
    var parentIds = $.map(vizJson.clusterMap, function(val, key) { return key; });
    $(".addedInterestDiv:visible").remove();
    $.each(parentIds, function(i, pid) {

        var name = vizJson.interests[pid].name;
        var elem = $("#queryInterestTemplate").clone();
        elem.attr('id', 'queryInterestKey' + pid);
        var html = elem.html();
        html = html.replace(/INTEREST_ID/g, ""+pid);
        html = html.replace(/INTEREST_NAME/g, ""+name.toLowerCase());
        elem.html(html);
        $("#queryInterestTemplate").before(elem);
        elem.find('.interestSlider').slider(
                {
                    min : 1, max : 5,
                    value : macademia.nbrviz.explore.queryWeights[pid] || 3,
                    change : function() {$.address.update();}
                }
        );

        // draw the sphere
        var k = $(".interestKey[interest='" + pid + "']");
        var w = k.width(), h = k.height();
        var p = new Raphael(k.get(0), w, h);
        var s = new Sphere({
            r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
            hue : macademia.nbrviz.getColor(pid, parentIds), paper : p
        });

    });
};


macademia.nbrviz.explore.initInterests = function(vizJson) {
    var interests = {};
    var parentIds = $.map(vizJson.clusterMap, function (value, key) { return key; });

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info && info.cluster >= 0);
        var color = hasCluster ? macademia.nbrviz.getColor(info.cluster, parentIds) : -1;
        interests[id] = new Interest({
            id:id,
            name:info.name,
            color:color,
            relevance : info.relevance,
            relatedQueryId : hasCluster ? info.cluster : -1
        });
    });

    return interests;
};


macademia.nbrviz.explore.initViz = function() {
    $.address.change(function(event) {
        var interestId = event.parameters.interestId;
        var personId = event.parameters.personId;
        var klass = interestId ? 'interest' : 'person';
        var rootId = interestId || personId;

        $(".interestSlider:visible").each(function () {
            var iid = $(this).attr('interest');
            var weight = 3;
            var weight = 3;
            if ($(this).length) {
                weight = $(this).slider( "option", "value" );
            } else if (iid in macademia.nbrviz.explore.queryWeights) {
                weight = macademia.nbrviz.explore.queryWeights[iid];
            }
            macademia.nbrviz.explore.queryWeights[iid] = weight;
            console.log('weight for ' + iid + ' is ' + weight);
        });

        console.log("refreshing viz to " + klass + " " + rootId);
        macademia.nbrviz.explore.refreshViz(klass, rootId);
    });
};


macademia.nbrviz.explore.initCluster = function(qid, vizJson, interests) {
    var paper = macademia.nbrviz.paper;
    var clusterMap = vizJson.clusterMap;
    var relatedInterests = $.map(clusterMap[qid], function(ri) {return interests[ri];});
    var info = vizJson.interests[qid];
    var parentIds = $.map(vizJson.clusterMap, function(val, key) { return key; });

    var ic = new InterestCluster({
        id : qid,
        interests : interests,
        relatedInterests : relatedInterests,
        name : info.name,
        color : macademia.nbrviz.getColor(qid, parentIds),
        paper : paper,
        collapsedRadius : (qid == vizJson.root) ? 30 : 20,
        clickText : '(click to re-center)'
    });
    ic.clicked(
            function (interest, interestNode) {
                macademia.nbrviz.explore.recenter('interest', interest.id);
            });
    return ic;
};

/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.explore.refreshViz = function(klass, rootId) {
    if (klass != 'person' && klass != 'interest') {
        alert('unknown klass: "' + klass + '" (must be person or interest).');
        return;
    }

    // TODO: make asynchronous
    var url = macademia.makeActionUrlWithGroup('all', 'explore', klass + 'Data') + '/' + rootId;

    var parentIds = [];
    var parentWeights = [];

    $.each(macademia.nbrviz.explore.queryWeights, function (k, v) {
        parentIds.push(k);
        parentWeights.push(v);
    });
    if (parentIds.length) {
        url += '?parentIds=' + parentIds.join('_');
        url += '&parentWeights=' + parentWeights.join('_');
    }

    var vizJson = null;
    $.ajax({
        url: url,
        dataType : 'json',
        success : macademia.nbrviz.explore.loadNewData
    });
    macademia.startTimer();

    $("#loadingMessage").html(macademia.nbrviz.explore.loadingMessage || "loading...");
    $('#loadingDiv').show();
};


macademia.nbrviz.explore.loadNewData = function(vizJson) {
    macademia.endTimer('ajax call');
    macademia.nbrviz.explore.initQueryKey(vizJson);
    macademia.endTimer('key');

    var paper = macademia.nbrviz.paper;
    if (paper) {
        paper.clear();
        Magnet.clear();
    } else {
        paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());
    }

    macademia.nbrviz.magnet.init();

    // interestId -> interest
    var interests = macademia.nbrviz.explore.initInterests(vizJson);
    macademia.nbrviz.explore.interests = interests;

    // queryInterestId -> clusterInterestId -> related interest ids
    var clusterMap = vizJson.clusterMap;

    // Create interest clusters
    var parentClusters = {};
    var numParentClusters = 0;
    $.each(vizJson.clusterMap, function (parentId) {
        parentClusters[parentId] = macademia.nbrviz.explore.initCluster(
                                parentId, vizJson, interests);
        numParentClusters++;
    });
    macademia.endTimer('up to queries');

    // Create people
    var people = {};

    // Normalize 'overall' relevances to modulate person ring size
    var maxRelevance = 0.0;
    var minRelevance = 1000000000000.0;
    $.each(vizJson.people, function(id, pinfo) {
        maxRelevance = Math.max(pinfo.relevance.overall, maxRelevance);
        minRelevance = Math.min(pinfo.relevance.overall, minRelevance);
    });

    var maxPeople = Math.max(8, screenArea() / 35000) - numParentClusters;

    var numPeople = 0;
//    console.profile();

    $.each(vizJson.people, function(id, pinfo) {
        if( numPeople++ >= maxPeople ) {
            return false; // break
        }

        var pinterests = $.map(pinfo.interests, function(i) { return interests[i]; });
        var totalRelevance = 0.0;
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall') {totalRelevance += weight;}
        });
        var totalCount = 0.0;
        $.each(pinfo.count, function(id, n) {
            if (id != 'overall' && id != '-1') {totalCount += n;}
        });
        var interestGroups = [];
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall' && weight > 0) {
                interestGroups.push([
                    parentClusters[id],
                    pinfo.relevance[id],
                    pinfo.count[id] / totalCount
                ]);
            }
        });
        var r = 10 * (pinfo.relevance.overall - minRelevance) / (maxRelevance - minRelevance) + 7;
        var person = new Person({
            relevance : pinfo.relevance,
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : $.grep(pinterests, function(i) {return (i.relatedQueryId >= 0);}),
            nonRelevantInterests : $.grep(pinterests, function(i) {return (i.relatedQueryId < 0);}),
            clickText : '(click to re-center)',
            collapsedRadius : r
        });
        if (person.interests.length > 12) {
            person.expandedRadius *= Math.sqrt(person.interests.length / 12);
        }
        person.clicked(
                function (interest, interestNode) {
                    macademia.nbrviz.explore.recenter('interest', interest.id);
                });
        people[id] = person;
    });
    macademia.nbrviz.query.people = people;
//    console.profileEnd();

    macademia.endTimer('loadNewData object creation');
    macademia.startTimer();

    var ev = new ExploreViz({
        rootId : vizJson.root,
        rootClass : vizJson.root,
        people :people,
        parentInterests : $.map(parentClusters, function(v, k) {return v;}),
        paper : paper
    });
    ev.setEnabled(false);
    $('#loadingDiv').hide();
    ev.layoutInterests();
    ev.layoutPeople();
    ev.setupListeners();

//    macademia.nbrviz.qv = qv;
    macademia.nbrviz.query.loadingMessage = null;
    macademia.endTimer('layout');
};