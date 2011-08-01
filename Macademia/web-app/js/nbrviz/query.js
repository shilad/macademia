/**
 * Glue that pieces together the data necessary for the QueryViz object.
 * @param vizJson
 */
macademia.nbrviz.initQueryViz = function(vizJson) {
    // create related interests
    var relatedInterests = {};
    $.each(vizJson.queries, function (i, id) {relatedInterests[id] = [];});
    $.each(vizJson.interests, function (id, info) {
        if (info.cluster && info.cluster >= 0) {
            var ri = new RelatedInterest(id, info.name, Math.random());
            relatedInterests[info.cluster].push(ri);
        }
    });

    // Create interest clusters
    var queryInterests = [];
    $.each(vizJson.queries, function (i, id) {
        var info = vizJson.interests[id];
        var ic = new InterestCluster({
            relatedInterests : relatedInterests[id],
            name : info.name,
            color : Math.random()
        });
        queryInterests.push(ic);
    });

    var paper = macademia.nbrviz.initPaper("graph", $(document).width(), $(document).height());
    var qv = new QueryViz({people : null, queryInterests : queryInterests, paper : paper});
    qv.layoutInterests();
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

function layoutPeople() {
    $.each(aJSON.people, function(index, value) {
        var xRand = Math.floor( Math.random() * ($(document).width() - 120) ) + 60;
        var yRand = Math.floor( Math.random() * ($(document).height() - 120) ) + 60;
        var parameters = {
            "xPos": xRand,
            "yPos": yRand,
            "picture": value['pic'],
            "name":value['name'],
            "interests":aJSON['interests'],
            /*"nonRelevantInterests": function() {
                                        var otherInterests = {};
                                        $.each(value['interests']), function(i, val) {
                                            try{
                                                console.log(aJSON['interests'][i]);
                                                return true; //continue
                                            } catch(ReferenceError) {
                                                otherInterests[i] = val;
                                            }
                                        }
                                        return otherInterests;
                                    }.call(),*/
            "interestGroups":   function() {
                                    var iGroups = [];
                                    $.each(value['relevence'], function(i,val) {
                                        if(i == 'overall') {
                                            return true;    // continue
                                        }
                                        iGroups.push([
                                                {
                                                    'name' : aJSON['interests'][i].name,
                                                    'color' : '#'+Math.floor(Math.random()*16777215).toString(16)   // random color
                                                },
                                                val
                                        ]);
                                    });
                                    return iGroups;
                                }.call(),
            "strokeWidth": value['relevence']['overall']
        };
        new Person( parameters );
    });
}

function layoutInterests() {
}
$(document).ready(function() {
//    console.log(aJSON);
//    macademia.nbrviz.initPaper("graph", $(document).width(), $(document).height() );
//    layoutPeople();
//    layoutInterests();
});

