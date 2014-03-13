package org.macademia.graph;

import gnu.trove.set.TLongSet;
import gnu.trove.set.hash.TLongHashSet;

import java.util.List;

/**
 * Captures the relationship between a single person and a single cluster.
 *
 * @author Shilad Sen
 */
public class PersonClusterInfo {
    private final long personId;
    private final long clusterId;
    private TLongSet interestIds = new TLongHashSet();
    private double relevance = 0.0;

    public PersonClusterInfo(long personId, long clusterId) {
        this.personId = personId;
        this.clusterId = clusterId;
    }

    public long getPersonId() {
        return personId;
    }

    public long getClusterId() {
        return clusterId;
    }

    public TLongSet getInterestIds() {
        return interestIds;
    }

    public double getRelevance() {
        return relevance;
    }
}
