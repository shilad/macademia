macademia.nbrviz.getQueryIds = function() {
    return $.address.parameter('queryIds').split('_');
};
macademia.nbrviz.queryWeights = {};
macademia.nbrviz.loadingMessage = null;

macademia.nbrviz.addInterestToQuery = function(id, name) {
    if (name == null) {
        name = macademia.getInterestName(id);
    }
    macademia.nbrviz.loadingMessage = 'adding "' + name + '"...';
    var ids = macademia.nbrviz.getQueryIds();
    if ($.inArray(''+id, ids) < 0) {
        ids.push(id);
        $.address.parameter('queryIds', ids.join('_'));
    } else {
        return true;
    }
};

macademia.nbrviz.removeInterestFromQuery = function(id) {
    var name = macademia.nbrviz.interests[id].name;
    macademia.nbrviz.loadingMessage = 'removing "' + name + '"...';
    var ids = macademia.nbrviz.getQueryIds();
    var i = $.inArray(''+id, ids);
    ids.splice(i, 1);
    $.address.parameter('queryIds', ids.join('_'));
};

macademia.nbrviz.initQueryKey = function() {
    $(".addedInterestDiv:visible").remove();
    $.each(macademia.nbrviz.getQueryIds(), function(i, qid) {
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
                    value : macademia.nbrviz.queryWeights[qid] || 3,
                    change : function() {$.address.update();}
                }
        );
        elem.find('a.removeInterest').click(function() {
            macademia.nbrviz.removeInterestFromQuery(qid);
            return false;
        });
    });
};

macademia.nbrviz.drawKeySpheres = function() {
    $.each(macademia.nbrviz.getQueryIds(), function(i, id) {
        // draw the sphere
        var qi = macademia.nbrviz.interests[id];
        var k = $(".interestKey[interest='" + id + "']");
        var w = k.width(), h = k.height();
        var p = new Raphael(k.get(0), w, h);
        var s = new Sphere({
            r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
            hue : qi.color, paper : p
        });
    });
};


macademia.nbrviz.initClusterColors = function(vizJson) {
    var clusterColors = {};
    $.each(vizJson.queries, function (i, id) {
        clusterColors[id] = 1.0 * i / vizJson.queries.length + 1.0 / vizJson.queries.length / 2;
    });
    return clusterColors;
};

macademia.nbrviz.initQueryInterests = function(vizJson, clusterColors) {
    var interests = {};

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info && info.cluster >= 0);
        var color = hasCluster ? clusterColors[info.cluster] : -1;
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

macademia.nbrviz.initQueryClusterMap = function(vizJson) {
    var clusterMap = {};

    $.each(vizJson.queries, function (i, id) {
        clusterMap[id] = {};
    });

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        var hasCluster = (info && info.cluster >= 0);
        var hasSubCluster = (info && info.subcluster >= 0);
        if (hasCluster && hasSubCluster) {
            if (!(info.subcluster in clusterMap[info.cluster])) {
                clusterMap[info.cluster][info.subcluster] = [];
            }
            if (id != info.cluster && id != info.subcluster) {
                clusterMap[info.cluster][info.subcluster].push(id);
            }
        }
    });

    return clusterMap;
};

macademia.nbrviz.initQueryCluster = function(qid, vizJson, clusterColors, clusterMap, interests) {
    var paper = macademia.nbrviz.paper;
    var subclusters = [];
    $.each(clusterMap[qid], function(cid, relatedInterests) {
        var info = vizJson.interests[cid];
        var ris = $.map(relatedInterests, function(ri) { return interests[ri]; });
        subclusters.push(
                new InterestCluster({
                    id : cid,
                    interest : interests[cid],
                    relatedInterests : ris,
                    name : info.name,
                    color : clusterColors[qid],
                    paper : paper
                }));
    });
    var info = vizJson.interests[qid];
    var ic = new InterestCluster({
        id : qid,
        interests : interests,
        interest : interests[qid],
        subclusters : subclusters,
        name : info.name,
        color : clusterColors[qid],
        paper : paper,
        inQuery : true
    });
    ic.addClicked(
            function (interest, interestNode) {
                macademia.nbrviz.addInterestToQuery(interest.id);
            });
    if (ic.relatedInterests.length > 12) {
        ic.expandedRadius *= Math.sqrt(ic.relatedInterests.length / 12);
    }
    return ic;
};

macademia.nbrviz.initQueryViz = function() {
    $.address.change(function(event) {
        var queryIds = event.parameters.queryIds.split('_');
        $.each(queryIds, function(i, qid) {
            var weight = 3;
            var slider = $(".interestSlider[interest=" + qid + "]");
            if (slider.length) {
                weight = slider.slider( "option", "value" );
            } else if (qid in macademia.nbrviz.queryWeights) {
                weight = macademia.nbrviz.queryWeights[qid];
            }
            macademia.nbrviz.queryWeights[qid] = weight;
            console.log('weight for ' + qid + ' is ' + weight);
        });
        console.log("refreshing viz..." + queryIds);
        macademia.nbrviz.refreshQueryViz(queryIds);
    });

};

/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.refreshQueryViz = function(queryIds) {
    macademia.nbrviz.initQueryKey();

    // TODO: make asynchronous
    var url = macademia.makeActionUrlWithGroup('all', 'query', 'data');
    var weights = [];
    $.each(queryIds, function(i, qid) {
            weights.push(macademia.nbrviz.queryWeights[qid] || 3);
        });
    url += '?queryIds=' + queryIds.join('_');
    url += '&queryWeights=' + weights.join('_');
    var vizJson = null;
    $.ajax({
        url: url,
        dataType : 'json',
        success : macademia.nbrviz.loadNewData
    });
    macademia.startTimer();

    $("#loadingMessage").html(macademia.nbrviz.loadingMessage || "loading...");
    $('#loadingDiv').show();
};

macademia.nbrviz.loadNewData = function(vizJson) {
    macademia.endTimer('ajax call');

    var paper = macademia.nbrviz.paper;
    if (paper) {
        paper.clear();
        Magnet.clear();
    } else {
        paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());
    }

    width = $(document).width()-50;
    height = $(document).height()-50;

    // cluster ids to hues in [0,1]
    var clusterColors = macademia.nbrviz.initClusterColors(vizJson);

    // interestId -> interest
    var interests = macademia.nbrviz.initQueryInterests(vizJson, clusterColors);
    macademia.nbrviz.interests = interests;

    // queryInterestId -> clusterInterestId -> related interest ids
    var clusterMap = macademia.nbrviz.initQueryClusterMap(vizJson);

    macademia.nbrviz.initQueryInterests(vizJson, clusterColors, clusterMap, interests);
    macademia.nbrviz.drawKeySpheres();

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, qid) {
        queryInterests[qid] = macademia.nbrviz.initQueryCluster(
                                qid, vizJson, clusterColors, clusterMap, interests);
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
                    queryInterests[id],
                    pinfo.relevance[id],
                    pinfo.count[id] / totalCount
                ]);
            }
        });
        var r = 20 * (pinfo.relevance.overall - minRelevance) / (maxRelevance - minRelevance) + 10;
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
        people[id] = person;
    });
    macademia.nbrviz.people = people;
//    console.profileEnd();

    macademia.endTimer('loadNewData object creation');
    macademia.startTimer();

    var qv = new QueryViz({
        people : $.map(people, function(v, k) {return v;}),
        queryInterests : $.map(queryInterests, function(v, k) {return v;}),
        paper : paper
    });
    qv.layoutInterests();
    qv.layoutPeople();
    qv.setupListeners();
    macademia.nbrviz.qv = qv;

    $('#loadingDiv').hide();
    macademia.nbrviz.loadingMessage = null;
    macademia.endTimer('layout');
};