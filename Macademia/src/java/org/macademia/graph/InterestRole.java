package org.macademia.graph;

/**
 * Conveys the purpose of an interest in the visualization.
 */
public class InterestRole implements Comparable<InterestRole> {
    public enum RoleType {
        ROOT,                       // Center of an interest-centric viz
        RELATED_ROOT,               // Root of a cluster not at the center of the viz
        CHILD_OF_ROOT,              // Direct child of the root
        DISTANT_RELATED_ROOT,       // Unused for now...
        CHILD_OF_RELATED,           // Direct child of a related root
        CHILD_OF_DISTANT_RELATED,   // Unused, for now...
        HIDDEN                      // Doesn't appear as a child of any cluster
    }

    private RoleType role;
    private long parentId;
    private double relevance = -1.0;

    public InterestRole(RoleType role, long parentId, double relevance) {
        this.role = role;
        this.parentId = parentId;
        this.relevance = relevance;
    }

    public int compareTo(InterestRole that) {
        int r = role.compareTo(that.role);
        if (r == 0 && relevance > that.relevance) {
            r = -1;
        } else if (r == 0 && relevance < that.relevance) {
            r = +1;
        }
        if (r == 0) {
            r = (int)(parentId - that.parentId);
        }
        return r;
    }

    public boolean equals(InterestRole that) {
        return compareTo(that) == 0;
    }

    public RoleType getRole() {
        return role;
    }

    public long getParentId() {
        return parentId;
    }

    public double getRelevance() {
        return relevance;
    }
}
