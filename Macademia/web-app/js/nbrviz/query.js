/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.initQueryViz = function(vizJson) {
    var paper = macademia.nbrviz.initPaper("graph", $(document).width(), $(document).height());

    // create related interests
    var relatedInterests = {};
    var relatedInterestsById = {};
    $.each(vizJson.queries, function (i, id) {relatedInterests[id] = [];});
    $.each(vizJson.interests, function (id, info) {
        if (info.cluster && info.cluster >= 0) {
            var ri = new RelatedInterest(id, info.name, Math.random());
            relatedInterests[info.cluster].push(ri);
            relatedInterestsById[id] = ri;
        }
    });

    // Create interest clusters
    var queryInterests = {};
    $.each(vizJson.queries, function (i, id) {
        var info = vizJson.interests[id];
        var ic = new InterestCluster({
            relatedInterests : relatedInterests[id],
            name : info.name,
            color : Math.random()
        });
        queryInterests[id] = ic;
    });

    // Create people
    // TODO: incorporate interest similarity scores
    var people = [];
    $.each(vizJson.people, function(id, pinfo) {
        var total = 0;
        var clusterRelevance = {};
        var pinterests = [];
        $.each(vizJson.queries, function(i, id) {clusterRelevance[id] = 0.0;});
        $.each(pinfo.interests, function(i, id) {
            var iinfo = vizJson.interests[id];
            if (iinfo.cluster && iinfo.cluster >= 0) {
                clusterRelevance[iinfo.cluster] += 1;
                total += 1.0;
            }
            pinterests.push(relatedInterestsById[id]);
        });
        var interestGroups = [];
        $.each(clusterRelevance, function(id, weight) {
            if (weight > 0) {
                interestGroups.push([
                    queryInterests[id],
                    1.0 * weight / total
                ]);
            }
        });
        var person = new Person({
            interestGroups : interestGroups,
            name : pinfo.name,
            picture : pinfo.pic,
            paper : paper,
            interests : pinterests ,
            nonRelevantInterests : []
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
