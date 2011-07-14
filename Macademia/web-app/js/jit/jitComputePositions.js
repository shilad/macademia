/**
 * This function is a replacement for the existing rgraph jit function.
 * After downloading a new library, it should be copy and pasted into place.
 */


   /*
     * computePositions
     *
     * Performs the main algorithm for computing node positions.
     */
    computePositions : function(property, getLength) {
        //Computes according to subnodes:
        var propArray = property;
        var graph = this.graph;
        var root = graph.getNode(this.root);
        var parent = this.parent;
        var config = this.config;
        var levelOneNodes = [];   //array of nodes in the inner circle (also will contain people with direct connection to root)
        var levelOneInfo = {};    //{levelOneNodeId: {subnodes: [arrayOfSubnodes], actualSubnodes: [arrayOfSubnodesUnderNode], angularWidths: sumOfSubnodesAngularWidths, angleSpan: angleSpan, angleInit: angleInit}}
        var levelTwoInfo = {};    // {nodeId, true/false}  keeps track of whether a node has been placed

        // sets position and properties of root node
        for ( var i=0, l=propArray.length; i < l; i++) {
            var pi = propArray[i];
            root.setPos($P(0, 0), pi);
            root.setData('span', Math.PI * 2, pi);
        }
        root.angleSpan = {
            begin : 0,
            end : 2 * Math.PI
        };


        var totalLevelOneAngularWidths = 0;
        // computes levelOneInfo, levelTwoInfo, and sum of angular widths, levelOneNodes, totalSubnodes
        graph.eachBFS(this.root,function(elem){
            // if the node is the root node
            if (elem.id == root.id){
                return
            }
            // if the node is an interest or a person directly connected to the root
            if(elem.data.type == 'interest' || (elem.getParents()[0].id == root.id && elem._depth == 1)){
                levelOneNodes.push(elem);
                totalLevelOneAngularWidths += elem._treeAngularWidth;

                // Create a list of all subnodes sorted by the number of parents they have.
                var elemSubnodes = [];
                elem.eachSubnode(function(sib) {
                    elemSubnodes.push(sib);
                }, "ignore");
                elemSubnodes.sort(function(a, b) {
                    return (a.getParents().length - b.getParents().length);
                }),
                    //set entry in levelOneInfo
                        levelOneInfo[elem.id]= {
                            subnodes:elemSubnodes,
                            actualSubnodes: [], // subnodes placed under this node.
                            angularWidths: 0,
                            angleSpan: 0,
                            angleInit: 0
                        };
                // if node is a person or request not directly connected to the root.
            }else if(elem.data.type == 'person' || elem.data.type == 'request'){
                // node is not yet placed
                levelTwoInfo[elem.id]=true;
            }

        }, 'ignore');

        //sorts nodes according to their number of subnodes
        levelOneNodes.sort(function(a, b) {
            return (levelOneInfo[a.id].subnodes.length - levelOneInfo[b.id].subnodes.length);
        });

        // places all subnodes.
        while (macademia.size(levelTwoInfo) > 0) {
            // for each node in the first level
            for(var m = 0; m<levelOneNodes.length; m++){
                var parentNode = levelOneNodes[m];
                var parentInfo = levelOneInfo[parentNode.id];
                // subnode is not yet placed
                var placed = false;
                // while subnode is not yet placed, and the parent node still has subnodes to place
                while(!placed && parentInfo.subnodes.length>0){
                    var node = parentInfo.subnodes[0];
                    // if this node is not yet placed (levelTwoInfo entry is false)
                    if(levelTwoInfo[node.id]){
                        // node is marked as placed
                        delete levelTwoInfo[node.id];
                        // subnode is placed, goes onto next levelOneNode and places one subnode
                        placed = true;
                        // node is added to individual list of actual subnodes to be placed under parent node
                        parentInfo.actualSubnodes.push(node);
                        // node removed from parent's total subnode list
                        parentInfo.subnodes.splice(0,1);
                    }else{
                        //node is removed from parent's total subnode list to prevent it from being cycled through more than necessary
                        parentInfo.subnodes.splice(0,1);
                    }
                }
            }
        }

        var levelOneAngleSpan = root.angleSpan.end - root.angleSpan.begin;
        var levelOneAngleInit = root.angleSpan.begin;

        levelOneNodes.sort(function(a, b) {
            return (levelOneInfo[a.id].actualSubnodes.length - levelOneInfo[b.id].actualSubnodes.length);
        });

        // function for level one nodes that sets polar coords
        function levelOnePolarCoord(node){
                var nodeInfo = levelOneInfo[node.id];
                // determines angularWidths and angleSpans
                var nodeAngularWidths = 0;
                // goes through each subnode to get total angular widths for each node
                for (var x = 0; x < nodeInfo.actualSubnodes.length; x++){
                    var sib = nodeInfo.actualSubnodes[x];
                    nodeAngularWidths += sib._treeAngularWidth;
                }
                var nodeAngleSpan = node.angleSpan.end - node.angleSpan.begin;
                var nodeAngleInit = node.angleSpan.begin;
                //set values to be used in placing nodes in second level
                nodeInfo.angleSpan = nodeAngleSpan;
                nodeInfo.angleInit = nodeAngleInit;
                nodeInfo.angularWidths = nodeAngularWidths;
                var len = config.levelDistance;
                // if node is person or request, place in outer ring
                if (node.data.type == 'person' || node.data.type == 'request'){
                    len = config.levelDistance * 2;
                }
                // node's proportional section of graph as determined by it's angular widths in proportion to the total angular widths of the graph.
                var angleProportion = node._treeAngularWidth / totalLevelOneAngularWidths * levelOneAngleSpan;
                // node position in center of it's angle span
                var theta = levelOneAngleInit + angleProportion / 2;
                //sets some properties
                for ( var i=0, l=propArray.length; i < l; i++) {
                    var pi = propArray[i];
                    // sets the position of the node
                    node.setPos($P(theta, len), pi);
                    // sets some other stuff.
                    node.setData('span', angleProportion, pi);
                }
                //sets area of graph belonging to node.
                node.angleSpan = {
                    begin : levelOneAngleInit,
                    end : levelOneAngleInit + angleProportion
                };
                // sets properties of node to be used in placing subnodes
                nodeInfo.angleSpan = node.angleSpan.end - node.angleSpan.begin;
                nodeInfo.angleInit = node.angleSpan.begin;
                // increments the placement on the graph.
                levelOneAngleInit += angleProportion;
        }
        // loops through level one nodes to set their polar coords
        for(var j=0; j<levelOneNodes.length/2; j++){
            var node1 = levelOneNodes[j];
            levelOnePolarCoord(node1);
            var g = levelOneNodes.length - j - 1;
            if (g != j){
                var node2 = levelOneNodes[g];
                levelOnePolarCoord(node2);
            }
        }



        // sets polar coordinates for level two nodes
        for(var m = 0; m<levelOneNodes.length; m++){
            var parentNode = levelOneNodes[m];
            var parentNodeInfo = levelOneInfo[parentNode.id];
            // for every actual subnode of the parent node
            for (var n = 0; n<parentNodeInfo.actualSubnodes.length; n++){
                var node = parentNodeInfo.actualSubnodes[n];
                // node is in second ring
                var len = config.levelDistance * 2;
                // node's section of graph
                var angleProportion = node._treeAngularWidth / parentNodeInfo.angularWidths * parentNodeInfo.angleSpan;
                // node's position on graph
                var theta = parentNodeInfo.angleInit + angleProportion / 2;
                // sets some properties
                for ( var i=0, l=propArray.length; i < l; i++) {
                    var pi = propArray[i];
                    // sets node's position
                    node.setPos($P(theta, len), pi);
                    // sets other stuff
                    node.setData('span', angleProportion, pi);
                }

                //sets area of graph belonging to node
                node.angleSpan = {
                    begin : parentNodeInfo.angleInit,
                    end : parentNodeInfo.angleInit + angleProportion
                };
                // increments placement for the group according to parent node
                parentNodeInfo.angleInit += angleProportion;
            }
        }
    }