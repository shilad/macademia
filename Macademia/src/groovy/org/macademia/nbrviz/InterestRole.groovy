package org.macademia.nbrviz

/**
 * Conveys purpose of an interest in the visualization.
 */
class InterestRole implements Comparable<InterestRole> {
    enum RoleType {
        ROOT,
        RELATED_ROOT,
        CHILD_OF_ROOT,
        DISTANT_RELATED_ROOT,
        CHILD_OF_RELATED,
        CHILD_OF_DISTANT_RELATED,
        HIDDEN
    }
    RoleType role
    long parentId
    double relevance = -1.0

    public int compareTo(InterestRole that) {
        int r = role.compareTo(that.role)
        if (r == 0 && relevance > that.relevance) {
            r = -1
        } else if (r == 0 && relevance < that.relevance) {
            r = +1
        }
        if (r == 0) {
            r = parentId - that.parentId
        }
        return r
    }

    public boolean equals(InterestRole that) {
        return compareTo(that) == 0
    }

}
