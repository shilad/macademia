macademia.nbrviz.explore = {};

macademia.nbrviz.explore.isInterestGraph = function() {
    return $.address.parameter('interestId');
};

macademia.nbrviz.explore.isPersonGraph = function() {
    return $.address.parameter('personId');
};

macademia.nbrviz.explore.initQueryKey = function(parentIds) {
    $(".addedInterestDiv:visible").remove();
    $.each(parentIds, function(i, qid) {
        // TODO: replace with non-ajax lookup into datastructure
        var name = macademia.getInterestName(qid);
        var elem = $("#queryInterestTemplate").clone();
        elem.attr('id', 'queryInterestKey' + qid);
        var html = elem.html();
        html = html.replace(/INTEREST_ID/g, ""+qid);
        html = html.replace(/INTEREST_NAME/g, ""+name.toLowerCase());
        elem.html(html);
        $("#queryInterestTemplate").before(elem);
        elem.find('.interestSlider').slider(
                {
                    min : 1, max : 5,
                    value : macademia.nbrviz.explore.queryWeights[qid] || 3,
                    change : function() {$.address.update();}
                }
        );
    });
};

macademia.nbrviz.explore.drawKeySpheres = function(parentIds) {
    $.each(parentIds, function(i, id) {
        // draw the sphere
        var k = $(".interestKey[interest='" + id + "']");
        var w = k.width(), h = k.height();
        var p = new Raphael(k.get(0), w, h);
        var s = new Sphere({
            r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
            hue : macademia.nbrviz.getColor(id), paper : p
        });
    });
};


macademia.nbrviz.explore.initInterests = function(vizJson) {
    var interests = {};

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info && info.cluster >= 0);
        var color = hasCluster ? macademia.nbrviz.getColor(info.cluster) : -1;
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


        /*$.each(queryIds, function(i, qid) {
            var weight = 3;
            var slider = $(".interestSlider[interest=" + qid + "]");
            if (slider.length) {
                weight = slider.slider( "option", "value" );
            } else if (qid in macademia.nbrviz.query.queryWeights) {
                weight = macademia.nbrviz.query.queryWeights[qid];
            }
            macademia.nbrviz.query.queryWeights[qid] = weight;
            console.log('weight for ' + qid + ' is ' + weight);
        });*/
        console.log("refreshing viz to " + klass + " " + rootId);
        macademia.nbrviz.explore.refreshViz(klass, rootId);
    });
};


macademia.nbrviz.explore.initCluster = function(qid, vizJson, interests) {
    var paper = macademia.nbrviz.paper;
    var clusterMap = vizJson.clusterMap;
    var relatedInterests = $.map(clusterMap[qid], function(ri) {return interests[ri];});
    var info = vizJson.interests[qid];
    var ic = new InterestCluster({
        id : qid,
        interests : interests,
        relatedInterests : relatedInterests,
        name : info.name,
        color : macademia.nbrviz.getColor(qid),
        paper : paper,
        inQuery : true
    });
    ic.addClicked(
            function (interest, interestNode) {
                alert('pivoting to ' + interest.name);
            });
    return ic;
};

/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.explore.refreshViz = function(klass, rootId) {
//    macademia.nbrviz.query.initQueryKey();
//    macademia.nbrviz.query.drawKeySpheres();

    if (klass != 'person' && klass != 'interest') {
        alert('unknown klass: "' + klass + '" (must be person or interest).');
        return;
    }

    // TODO: make asynchronous
    var url = macademia.makeActionUrlWithGroup('all', 'explore', klass + 'Data') + '/' + rootId;
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
    macademia.nbrviz.query.interests = interests;

    // queryInterestId -> clusterInterestId -> related interest ids
    var clusterMap = vizJson.clusterMap;

    // Create interest clusters
    var parentClusters = {};
    $.each(vizJson.clusterMap, function (parentId) {
        parentClusters[parentId] = macademia.nbrviz.explore.initCluster(
                                parentId, vizJson, interests);
    });
    macademia.endTimer('up to queries');

    // Create people
    var people = [];

    // Normalize 'overall' relevances to modulate person ring size
    var maxRelevance = 0.0;
    var minRelevance = 1000000000000.0;
    $.each(vizJson.people, function(id, pinfo) {
        maxRelevance = Math.max(pinfo.relevance.overall, maxRelevance);
        minRelevance = Math.min(pinfo.relevance.overall, minRelevance);
    });

    var limit = 0;
    if ( screenArea() < 650000 ) {
        limit = 6;
    } else {
        limit = 20;
    }

    var numPeople = 0;
//    console.profile();

    $.each(vizJson.people, function(id, pinfo) {
        if( numPeople++ >= limit ) {
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
        var r = 10 * (pinfo.relevance.overall - minRelevance) / (maxRelevance - minRelevance) + 10;
        var person = new Person({
            relevance : pinfo.relevance,
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : $.grep(pinterests, function(i) {return (i.relatedQueryId >= 0);}),
            nonRelevantInterests : $.grep(pinterests, function(i) {return (i.relatedQueryId < 0);}),
            collapsedRadius : r
        });
        if (person.interests.length > 12) {
            person.expandedRadius *= Math.sqrt(person.interests.length / 12);
        }
        person.addClicked(
                function (interest, interestNode) {
                    alert('recentering on person interest ' + interest.name);
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
        people : $.map(people, function(v, k) {return v;}),
        parentInterests : $.map(parentClusters, function(v, k) {return v;}),
        paper : paper
    });
    $('#loadingDiv').hide();
    ev.layoutInterests();
    ev.layoutPeople();
    ev.setupListeners();

//    macademia.nbrviz.qv = qv;
    macademia.nbrviz.query.loadingMessage = null;
    macademia.endTimer('layout');
};