package org.macademia.graph;

import java.util.SortedSet;
import java.util.TreeSet;


/**
 * Captures the relationship of an interest to other interests in the viz.
 */
public class InterestInfo {
    private final long interestId;
    private long closestParentId = -1;
    private double closestRelevance = -1.0;

    private SortedSet<InterestRole> roles = new TreeSet<InterestRole>();

    public InterestInfo(long interestId) {
        this.interestId = interestId;
    }

    public void addRole(InterestRole.RoleType role, long parentId, double relevance) {
        if (relevance > closestRelevance) {
            closestRelevance = relevance;
            closestParentId = parentId;
        }
        if (role != InterestRole.RoleType.HIDDEN) {
            roles.add(new InterestRole(role, parentId, relevance));
        }
    }
    
    public InterestRole getRole(InterestRole.RoleType roleType) {
        for (InterestRole role : roles) {
            if (role.getRole() == roleType) {
                return role;
            }
        }
        return null;
    }

    public boolean hasRole(InterestRole.RoleType roleType) {
        return getRole(roleType) != null;
    }

    public long getInterestId() {
        return interestId;
    }

    public long getClosestParentId() {
        return closestParentId;
    }

    public double getClosestRelevance() {
        return closestRelevance;
    }

    public SortedSet<InterestRole> getRoles() {
        return roles;
    }
}
