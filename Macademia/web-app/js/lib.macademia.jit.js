var macademia = macademia || {};

macademia.jit = {};

macademia.jit.unfocusedEdgeColor = "#999";
macademia.jit.rootId;
macademia.nextNode = null;
macademia.jit.nextJson = null;
macademia.jit.distance = 150;
macademia.jit.refreshNeeded = true;
macademia.jit.intervalId = -1;

macademia.makeJsonUrl = function(type, id) {
    // TODO: should this really go here?
    var density = $.address.parameter('density');
    if (!density || density == undefined || density == 'undefined') {
        density = 3; 
    }
    return macademia.makeActionUrl(type, 'json') + "/" + id + "?institutions="+$.address.parameter('institutions') + "&density=" + density;
};

macademia.checkBrowser = function() {
    if (!$.browser.mozilla && !$.browser.safari) {
        alert('This website will not work properly on Internet Explorer.  Please use Firefox or Safari');
    }
};

// highlights adjacencies during mouseover
macademia.jit.highlightAdjacenciesOn = function(node){
    var adjacentNodes = [node.id];
    var root = macademia.rgraph.graph.getNode(macademia.rgraph.root);
    root.eachSubnode(function(n){
        n.eachAdjacency(function(adj){
            if (adj.nodeTo.id != node.id && adj.nodeFrom.id != node.id){
                if (adj.data.$color != macademia.jit.unfocusedEdgeColor && adj.data.$color != undefined){
                    if(adj.data.$color)
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
    for (var i = 0; i < adjacentNodes.length; i++){
        var adjN = "#" + adjacentNodes[i];
        $(adjN).css('opacity', 0.75);
        $(adjN).css('z-index', 30);
        $(adjN).css('background-color', '#A2AB8E');
        $(adjN).css('color', '#FFF');
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

    for (var i = 0; i < adjacentNodes.length; i++){
        var adjN = "#" + adjacentNodes[i];
        $(adjN).css('opacity', 0.8);
        $(adjN).css('z-index', 10);
        $(adjN).css('background-color','transparent');
        $(adjN).css('color', '#000');
    }
};

macademia.jit.init = function(rootType,id){
    macademia.checkBrowser();

    if(macademia.rgraph){
        $("#infovis").empty();
    }
    macademia.jit.rootId = id;
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
            'color': '#FFFFFF', /*'#ccddee'*/
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
                $(this).css('opacity', 0.75);
                $(this).css('z-index', 50);
                $(this).css('background-color', '#A2AB8E');
                macademia.jit.highlightAdjacenciesOn(node);
                macademia.rgraph.refresh();

            });
            $(d).mouseout(function() {
                $(this).css('opacity', 0.8);
                $(this).css('z-index', 10);
                $(this).css('background-color','transparent');
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
                                var institutionStr = $.address.parameter('institutions');
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
    //load tree from tree data.
    macademia.rgraph.loadJSON(json);
    //compute positions and plot
    macademia.resizeCanvas($("#infovis").width());
    // $('#infovis').draggable();
        
    })
};
