macademia.nbrviz.query = {};
macademia.nbrviz.query.getQueryIds = function() {
    var s = $.address.parameter('queryIds');
    if (s) {
        return $.address.parameter('queryIds').split('_');
    } else {
        return [];
    }
};
macademia.nbrviz.query.queryWeights = {};
macademia.nbrviz.query.loadingMessage = null;

macademia.nbrviz.query.addInterestToQuery = function(id, name) {
    if (name == null) {
        name = macademia.getInterestName(id);
    }
    macademia.nbrviz.query.loadingMessage = 'adding "' + name + '"...';
    var ids = macademia.nbrviz.query.getQueryIds();
    if ($.inArray(''+id, ids) < 0) {
        ids.push(id);
        $.address.parameter('queryIds', ids.join('_'));
    } else {
        return true;
    }
};

macademia.nbrviz.query.removeInterestFromQuery = function(id) {
    var name = macademia.nbrviz.query.interests[id].name;
    macademia.nbrviz.query.loadingMessage = 'removing "' + name + '"...';
    var ids = macademia.nbrviz.query.getQueryIds();
    var i = $.inArray(''+id, ids);
    ids.splice(i, 1);
    $.address.parameter('queryIds', ids.join('_'));
};

macademia.nbrviz.query.initQueryKey = function() {
    $(".addedInterestDiv:visible").remove();
    $.each(macademia.nbrviz.query.getQueryIds(), function(i, qid) {
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
                    value : macademia.nbrviz.query.queryWeights[qid] || 3,
                    change : function() {$.address.update();}
                }
        );
        elem.find('a.removeInterest').click(function() {
            macademia.nbrviz.query.removeInterestFromQuery(qid);
            return false;
        });
    });
};

macademia.nbrviz.query.drawKeySpheres = function() {
    $.each(macademia.nbrviz.query.getQueryIds(), function(i, id) {
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


macademia.nbrviz.query.initQueryInterests = function(vizJson) {
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

macademia.nbrviz.query.initQueryClusterMap = function(vizJson) {
    var clusterMap = {};

    $.each(vizJson.queries, function (i, id) {
        clusterMap[id] = [];
    });

    // build up nested map of clusters
    $.each(vizJson.interests, function (id, info) {
        if (info && info.isSubInterest) {
            clusterMap[info.cluster].push(id);
        }
    });

    return clusterMap;
};

macademia.nbrviz.query.initQueryCluster = function(qid, vizJson, clusterMap, interests) {
    var paper = macademia.nbrviz.paper;
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
                macademia.nbrviz.query.addInterestToQuery(interest.id, interest.name);
            });
    return ic;
};

macademia.nbrviz.query.initViz = function() {
    $.address.change(function(event) {
        if (!event.parameters.queryIds) {
            macademia.nbrviz.query.refreshViz([]);
            return;
        }
        var queryIds = event.parameters.queryIds.split('_');
        $.each(queryIds, function(i, qid) {
            var weight = 3;
            var slider = $(".interestSlider[interest=" + qid + "]");
            if (slider.length) {
                weight = slider.slider( "option", "value" );
            } else if (qid in macademia.nbrviz.query.queryWeights) {
                weight = macademia.nbrviz.query.queryWeights[qid];
            }
            macademia.nbrviz.query.queryWeights[qid] = weight;
            console.log('weight for ' + qid + ' is ' + weight);
        });
        console.log("refreshing viz..." + queryIds);
        macademia.nbrviz.query.refreshViz(queryIds);
    });

};

/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.query.refreshViz = function(queryIds) {
    macademia.nbrviz.query.initQueryKey();
    macademia.nbrviz.query.drawKeySpheres();

    if (!queryIds.length) {
        macademia.nbrviz.query.loadNewData(null);
        return;
    }

    // TODO: make asynchronous
    var url = macademia.makeActionUrlWithGroup('all', 'query', 'data');
    var weights = [];
    $.each(queryIds, function(i, qid) {
            weights.push(macademia.nbrviz.query.queryWeights[qid] || 3);
        });
    url += '?queryIds=' + queryIds.join('_');
    url += '&queryWeights=' + weights.join('_');
    var vizJson = null;
    $.ajax({
        url: url,
        dataType : 'json',
        success : macademia.nbrviz.query.loadNewData
    });
    macademia.startTimer();

    $("#loadingMessage").html(macademia.nbrviz.query.loadingMessage || "loading...");
    $('#loadingDiv').show();
};

macademia.nbrviz.query.loadNewData = function(vizJson) {
    macademia.endTimer('ajax call');

    var paper = macademia.nbrviz.paper;
    if (paper) {
        paper.clear();
        Magnet.clear();
    } else {
        paper = macademia.nbrviz.initPaper("graph", $("#graph").width(), $("#graph").height());
    }
    if (!vizJson) {
        $('#loadingDiv').hide();
        return;
    }

    macademia.nbrviz.magnet.init();

    // interestId -> interest
    var interests = macademia.nbrviz.query.initQueryInterests(vizJson);
    macademia.nbrviz.query.interests = interests;

    // queryInterestId -> clusterInterestId -> related interest ids
    var clusterMap = macademia.nbrviz.query.initQueryClusterMap(vizJson);

    macademia.nbrviz.query.initQueryInterests(vizJson, clusterMap, interests);

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, qid) {
        queryInterests[qid] = macademia.nbrviz.query.initQueryCluster(
                                qid, vizJson, clusterMap, interests);
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
        person.addClicked(
                function (interest, interestNode) {
                    macademia.nbrviz.addInterestToQuery(interest.id, interest.name);
                });
        people[id] = person;
    });
    macademia.nbrviz.query.people = people;
//    console.profileEnd();

    macademia.endTimer('loadNewData object creation');
    macademia.startTimer();

    var qv = new QueryViz({
        people : $.map(people, function(v, k) {return v;}),
        queryInterests : $.map(queryInterests, function(v, k) {return v;}),
        paper : paper
    });
    qv.setEnabled(false);
    qv.layoutInterests();
    qv.layoutPeople();
    qv.setupListeners();
    macademia.nbrviz.qv = qv;

    $('#loadingDiv').hide();
    macademia.nbrviz.query.loadingMessage = null;
    macademia.endTimer('layout');
};