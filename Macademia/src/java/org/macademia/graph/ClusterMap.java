package org.macademia.graph;

import gnu.trove.list.array.TLongArrayList;
import gnu.trove.map.TLongObjectMap;
import gnu.trove.map.hash.TLongObjectHashMap;
import gnu.trove.list.TLongList;
import gnu.trove.set.TLongSet;
import gnu.trove.set.hash.TLongHashSet;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Holds relationships between interest ids
 *
 * Cluster roots are keys, and values are their children.
 * If the overall root is an interest, it appears in clusterChildren
 *
 * @author Shilad Sen
 */
public class ClusterMap {
    /**
     * Overall root (may be a person or an interest)
     */
    private NodeType rootType;
    private long rootId;

    /**
     * Map from cluster root ids to children of root.
     * If overall root is an interest, contains rootId
     */
    private TLongObjectMap<TLongSet> clusterChildren = new TLongObjectHashMap<TLongSet>();

    public ClusterMap(NodeType rootType, long rootId) {
        this.rootType = rootType;
        this.rootId = rootId;
        if (rootType == NodeType.INTEREST) {
            addClusterRoot(rootId);
        }
    }

    public TLongSet getChildren(long interestId) {
        if (!clusterChildren.containsKey(interestId)) {
            clusterChildren.put(interestId, new TLongHashSet());
        }
        return clusterChildren.get(interestId);
    }

    public void addClusterRoot(long root) {
        if (!clusterChildren.containsKey(root)) {
            clusterChildren.put(root, new TLongHashSet());
        }
    }

    public void addClusterMember(long root, long child) {
        clusterChildren.get(root).add(child);
    }

    /**
     * If the graph is interest-centric, the root interest will appear first.
     * @return
     */
    public TLongList getClusterRootIds() {
        TLongList roots = new TLongArrayList(clusterChildren.keySet());
        if (rootType == NodeType.INTEREST) {
            roots.remove(rootId);
            roots.insert(0, rootId);
        }
        return roots;
    }

    public NodeType getRootType() {
        return rootType;
    }

    public long getRootId() {
        return rootId;
    }

    public String dump(EntityNamer namer) {
        StringBuilder b = new StringBuilder();
        String rootName = (rootType == NodeType.INTEREST) ? namer.getInterestName(rootId) : namer.getPersonName(rootId);
        b.append("\tCluster map for " + rootName + " (" + rootType.toString().toLowerCase() + " " + rootId + ")\n");
        for (long parent : clusterChildren.keys()) {
            b.append("\t\tcluster " + interestToString(namer, parent) + "\n");
            for (long child : clusterChildren.get(parent).toArray()) {
                b.append("\t\t\t" + interestToString(namer, child) + "\n");
            }
        }
        return b.toString();
    }

    private String interestToString(EntityNamer namer, long id) {
        return namer.getInterestName(id) + " (" + id + ")";
    }
}
