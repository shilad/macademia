package org.macademia.graph;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Shilad Sen
 */
public class PersonInfo {
    private final long personId;

    /**
     * The mapping from a cluster id to all the person's information in that cluster.
     */
    private final Map<Long, PersonClusterInfo> clusterInfo = new HashMap<Long, PersonClusterInfo>();

    public PersonInfo(long personId) {
        this.personId = personId;
    }

    public long getPersonId() {
        return personId;
    }

    public Map<Long, PersonClusterInfo> getClusterInfo() {
        return clusterInfo;
    }
}
