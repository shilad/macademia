var macademia = macademia || {};

macademia.jit = {};

macademia.jit.unfocusedEdgeColor = "#eee";
macademia.jit.rootId;
macademia.nextNode = null;
macademia.jit.nextJson = null;
macademia.jit.distance = 150;
macademia.jit.refreshNeeded = true;
macademia.jit.intervalId = -1;

// Used to synchronize building the graph. Fix to issue
// wherein interacting with elements which cause the graph
// to be rebuilt, such as the density widget, might interfere
// with each other, manifesting most often as multiple graphs
// being drawn.
macademia.jit.buildingGraph = false;

macademia.makeJsonUrl = function(type, id) {
    // TODO: should this really go here?
    var density = macademia.history.get('density');
    if (!density || density == undefined || density == 'undefined') {
        density = 3; 
    }
    return macademia.makeActionUrl(type, 'json') + "/" + id + "?institutions="+macademia.history.get('institutions') + "&density=" + density;
};

macademia.checkBrowser = function() {
    if (!$.browser.mozilla && !$.browser.safari) {
//        alert('This website will not work properly on Internet Explorer.  Please use Firefox or Safari');
    }
};

// highlights adjacencies during mouseover
macademia.jit.highlightAdjacenciesOn = function(node){
    var adjacentNodes = [node.id];
    var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
    root.eachSubnode(function(n){
        n.eachAdjacency(function(adj){
            if (adj.nodeTo.id != node.id && adj.nodeFrom.id != node.id){
                if (adj.data.$color != macademia.jit.unfocusedEdgeColor && adj.data.$color != undefined) {
                    adj.data.$colorB = adj.data.$color;
                    adj.data.$color = macademia.jit.unfocusedEdgeColor;
                }
            }else if (adj.nodeTo.id != node.id){
                adjacentNodes.push(adj.nodeTo.id);
                adj.data.$lineWidth = 1.8;
            }else{
                adjacentNodes.push(adj.nodeFrom.id);
                adj.data.$lineWidth = 1.8;
            }
        })
    });

    $(".node").css('color', '#aaa');
    for (var i = 0; i < adjacentNodes.length; i++){
        var adjN = "#" + adjacentNodes[i];
        $(adjN).css('color', '#000');
    }
};

// returns graph to original coloring during mouseout
macademia.jit.highlightAdjacenciesOff = function(node){
    var adjacentNodes = [node.id];
    var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
    root.eachSubnode(function(n){
        n.eachAdjacency(function(adj) {
            if (adj.nodeTo.id != node.id && adj.nodeFrom.id != node.id){
                if(adj.data.$colorB != macademia.jit.unfocusedEdgeColor && adj.data.$colorB != undefined){
                    adj.data.$color = adj.data.$colorB;
                }
            } else if (adj.nodeTo.id != node.id) {
                adjacentNodes.push(adj.nodeTo.id);
                adj.data.$lineWidth = 1;
            } else {
                adjacentNodes.push(adj.nodeFrom.id);
                adj.data.$lineWidth = 1;
            }
        })
    });
    $(".node").css('color', '#000');
};

// highlight institution edges during mouseover of the institution key
macademia.jit.highlightInstitutionOn = function(institution) {
    var instNodes = [];
    var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
    root.eachSubnode(function(n) {
        n.eachAdjacency(function(adj) {
            if (adj.nodeTo['data']['institution'] != institution && adj.nodeFrom['data']['institution'] != institution) {
                if (adj.data.$color != macademia.jit.unfocusedEdgeColor && adj.data.$color != undefined) {
                    adj.data.$colorB = adj.data.$color;
                    adj.data.$color = macademia.jit.unfocusedEdgeColor;
                }
            } else {
                instNodes.push(adj.nodeFrom.id);
                instNodes.push(adj.nodeTo.id);
                adj.data.$lineWidth = 1.8;
            }
        });
    });
    $(".node").css('color', '#aaa');
    for (var i = 0; i < instNodes.length; i++){
        var adjN = "#" + instNodes[i];
        $(adjN).css('color', '#000');
    }
};

// returns graph to original coloring during mouseout
macademia.jit.highlightInstitutionOff = function(institution) {
    var instNodes = [];
    var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
    root.eachSubnode(function(n) {
        n.eachAdjacency(function(adj) {
            if (adj.nodeTo['data']['institution'] != institution && adj.nodeFrom['data']['institution'] != institution) {
                if(adj.data.$colorB != macademia.jit.unfocusedEdgeColor && adj.data.$colorB != undefined){
                    adj.data.$color = adj.data.$colorB;
                }
            } else {
                instNodes.push(adj.nodeFrom.id);
                instNodes.push(adj.nodeTo.id);
                adj.data.$lineWidth = 1;
            }
        });

    });
    $(".node").css('color', '#000');
};

macademia.jit.init = function(rootType,id){

    if (macademia.jit.buildingGraph) {
        return;
    }
    macademia.jit.buildingGraph = true;

    macademia.checkBrowser();

    if(macademia.rgraph){
        $("#infovis").empty();
    }
    macademia.jit.rootId = id;
    if (rootType == 'empty') {
        $("#empty").show();
        return false;
    }
    $("#empty").hide();
    if (rootType != 'person' && rootType != 'interest' && rootType != 'request'){
        alert('unknown root type: ' + rootType);
        return false;
    }
    var json = null;
    $.getJSON(macademia.makeJsonUrl(rootType,id),function(data){
        json = data;
        macademia.rgraph = new $jit.RGraph({
            'injectInto': 'infovis',
            'width': 680,
            'height': 660,
            'duration' : 1000,
            'fps' : 40,
            withLabels : true,
            levelDistance: macademia.jit.distance,
            background: {
                      levelDistance: macademia.jit.distance,
                      numberOfCircles: 2,
                      CanvasStyles: {
                        strokeStyle: '#6A705D'
                      }
                    },

        Node: {
            'overridable': true,
            'type': 'circle',
            'color': '#088', /*'#ccddee'*/
            'width' : '4px'
        },
        Edge: {
            'overridable':true,
            'color': 'blue'//'#772277'
        },
        //interpolation type, can be linear or polar
        interpolation: 'polar',
        //parent-children distance


        //Set node/edge styles

        onPlaceLabel: function(domElement, node) {
            $(domElement).attr('alt', macademia.makeActionUrl(node.data.type, 'tooltip') + '/'+node.data.unmodifiedId);
            var nodeTop = parseInt(domElement.style.top) - 10.5;
            // $(macademia.rgraph.root.id).css not working
            var boost = (nodeTop -  (macademia.jit.distance * 2 + 20))/ (2*macademia.jit.distance) * 11.5;
            var d = $(domElement);
            var left = parseInt(d.css('left'));
            var w = domElement.offsetWidth;
            if(node.pos.rho == 0){
                d.css('left', (left - w /2) + 'px');
                d.css('text-align', 'center');
                // center node
            }else if(node.pos.theta >1.4 && node.pos.theta <1.6){
                d.css('left', (left - w /2) + 'px');
                d.css('top', nodeTop + boost + 'px');
                d.css('text-align', 'center');
                // space below graph
            }else if(node.pos.theta > 4.6 && node.pos.theta < 4.8){
                d.css('left', (left - w /2) + 'px');
                d.css('top', nodeTop + boost + 'px');
                d.css('text-align', 'center');
                // space above graph
            }else if(node.pos.theta <= 4.65 && node.pos.theta >= 1.55){
                d.css('top', nodeTop + boost + 'px');
                d.css('left', (left - w - 4.5) + 'px');
                d.css('text-align', 'right');
                // space to the left
            }else if(node.pos.theta >= 4.65 || node.pos.theta <= 1.45){
                d.css('top', nodeTop + boost + 'px');
                d.css('left', (left + 4.5) + 'px');
                d.css('text-align', 'left');
                // space to the right
            }
            d.css('width', '');
            d.css('height', '');
            if(node.pos.rho == 300){
                // prevent people nodes on right from wrapping unnecessarily
                d.css('min-width', '100px');
            }
            var distance = macademia.jit.distance * (0.95 * Math.min(parseInt($("#infovis-canvaswidget").css('width')) / 680, parseInt($("#infovis-canvaswidget").css('height')) / 660));
            d.css('max-width', (distance) + 'px');
            d.css('white-space', '');


        },
            //Add a controller to make the tree move on click.
            onCreateLabel: function(domElement, node) {
                //alert('here 3');
                var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
                var d = $(domElement);
                d.html(node.name);
                d.css('z-index', 10);
                d.css('opacity', 0.8);
                d.css('white-space', 'nowrap');
                d.css('margin-top', '3px');
                d.css('font-size', '14px');
                d.css('background-color','transparent');
                if(node.id == root.id){
                    d.css('font-weight', 600);
                }
            $(d).mouseover(function() {
                macademia.jit.highlightAdjacenciesOn(node);
                macademia.rgraph.refresh();

            });
            $(d).mouseout(function() {
                if (macademia.jit.refreshNeeded){
                    macademia.jit.highlightAdjacenciesOff(node);
                    macademia.rgraph.refresh();
                }
            });
            $(d).click(function() {
                if(macademia.jit.refreshNeeded){
                    if(macademia.jit.rootId != parseFloat(node.id.substr(2))){
                        macademia.jit.refreshNeeded = false;
                        macademia.jit.highlightAdjacenciesOff(node);
                    }
                    macademia.navInfovis(node);
//                      rgraph.onClick(node.id);
                }

            });



            d.qtip({
                content:{
                    text:'loading...'
                },
                api: {
                    beforeShow:function() {
                        var url = this.elements.target.attr('alt');
                        if (url != '') {
                            var params = {};
                            if (node.data.type == 'person'|| node.data.type == 'request') {
                                var rootId =macademia.rgraph.graph.getNode(macademia.rgraph.root).id;
                                var institutionStr = macademia.history.get('institutions');
                                params = {node : node.id, root: rootId, institutions : institutionStr};
                            }
                            this.loadContent(url, params, 'post');
                            macademia.serverLog('tooltip', 'show', params);
                        }
                    },
                    onContentLoad:function() {
                        this.elements.target.attr('alt', '');
                    }
                },
                style:{
                    tip:{
                        corner:'topLeft',
                        size:{
                            x:'700',
                            y:'300'
                        }
                    },
                    width: {
                        min: 250,
                        max: 250
                    }
                },
                position:{
                    adjust : {
                        screen : true
                    }
                }

            });


        },
        onBeforeCompute:function(node) {
            if (node.data.unmodifiedId) {
                macademia.nextNode = node;

                // Fetch the next data
                var rootId = macademia.nextNode.data.unmodifiedId;
                var rootType = macademia.nextNode.data.type;
                macademia.jit.nextJson = null;

                $(".qtip").hide();
                $.getJSON(macademia.makeJsonUrl(rootType, rootId), function(data) {
                    macademia.jit.nextJson = data;
                });
 
                if (macademia.jit.intervalId > 0) {
                    clearInterval(macademia.jit.intervalId);
                    macademia.jit.intervalId = -1;
                }
            }
        },

        //morph to new data after anim and if user has clicked a person node
        onAfterCompute:function() {
            if (macademia.nextNode) {
                
                macademia.jit.intervalId = setInterval(function () {
                    if (macademia.jit.nextJson == null) {
                        return;
                    }
                    var data = macademia.jit.nextJson;
                    macademia.jit.nextJson = null;
                    
                    // set up the institution key
                    macademia.jit.setInstitutionKey(macademia.jit.getColorsFromJson(data));
                    
                    if (macademia.jit.intervalId > 0) {
                        clearInterval(macademia.jit.intervalId);
                        macademia.jit.intervalId = -1;
                    }

                    macademia.jit.rootId = macademia.nextNode.data.unmodifiedId;
                    var rootType = macademia.nextNode.data.type;
                    macademia.checkBrowser();

                    macademia.rgraph.labels.clearLabels(true);
                    macademia.rgraph.op.morph(data, {
                        type:'fade',
                        duration:500,
                        onComplete: function() {
                            $(".qtip").hide();
                            // second morph to remove bugs...
                            macademia.rgraph.op.morph(data, {type: 'replot', duration : 10, hideLabels: true});
                        },
                        hideLabels:true
                    });
                    macademia.nextNode = null;
                    macademia.jit.refreshNeeded = true;
                }, 10);
                $(".qtip").hide();
            }
        }

    });
    // set up the institution key
    macademia.jit.setInstitutionKey(macademia.jit.getColorsFromJson(json));
    //load tree from tree data.
    macademia.rgraph.loadJSON(json);
    //compute positions and plot
    macademia.resizeCanvas($("#infovis").width());
    // $('#infovis').draggable();

    macademia.jit.buildingGraph = false;
        
    })
};

// Returns a mapping of institution ids to colors.
macademia.jit.getColorsFromJson = function(json) {
    var colors = {};
    $.each(json, function(key, value) {
        if ((json[key]['data']['type'] == 'person') && (json[key]['adjacencies'][0])) {
            colors[json[key]['data']['institution']] = json[key]['adjacencies'][0]['data']['$color'];
        }
    });
    return colors;
};

// Places an institution key on the page, telling the user what
// the edge colors on the graph represent.
macademia.jit.setInstitutionKey = function(colors) {
    $("#keyInstitutions").empty();
    var all = null;
    for (var igMapKey in macademia.igMap) {
        if (macademia.igMap[igMapKey]["info"]["abbrev"] == "all") {
            all = macademia.igMap[igMapKey]["institutions"];
            break;
        }
    }
    for (var colorKey in colors) {
        var instName;
        for (var instKey in all) {
            if (all[instKey]["id"] == colorKey) {
                instName = all[instKey]["name"];
                break;
            }
        }

        var instKeyEntry = $("#instKeyEntryTemplate").clone();
        var instColor = $(".instColorTemplate").clone();
        $(instColor).attr('class', "instColor");
        $(instColor).css("background-color", colors[colorKey]);
        $(instKeyEntry).attr('id', "instKey_" + colorKey);
        $(instKeyEntry).html(instName + ":");
        $(instKeyEntry).append(instColor);
        $("#keyInstitutions").append(instKeyEntry);
        
        $(instKeyEntry).hover(
        function() {
            var institution = this.id.split("_")[1];
            macademia.jit.highlightInstitutionOn(institution);
            macademia.rgraph.refresh();
        }, function() {
            var institution = this.id.split("_")[1];
            if (macademia.jit.refreshNeeded){
                macademia.jit.highlightInstitutionOff(institution);
                macademia.rgraph.refresh();
            }
        });
    }
};
