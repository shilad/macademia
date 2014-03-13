package org.macademia.graph;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Shilad Sen
 */
public class MacademiaGraph {
    private ClusterMap clusterMap;

    private Map<Long, InterestInfo> interests = new HashMap<Long, InterestInfo>();
    private Map<Long, PersonInfo> people = new HashMap<Long, PersonInfo>();

    public MacademiaGraph(NodeType rootType, long rootId) {
        this.clusterMap = new ClusterMap(rootType, rootId);
    }

    public void setClusterMap(ClusterMap map) {
        this.clusterMap =map;
    }
}
