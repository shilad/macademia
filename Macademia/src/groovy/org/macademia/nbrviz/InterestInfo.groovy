package org.macademia.nbrviz

import org.macademia.nbrviz.InterestRole.RoleType

class InterestInfo {
    long interestId = 0
    long closestParentId = -1
    double closestRelevance = -1.0

    SortedSet<InterestRole> roles = new TreeSet<InterestRole>()

    void addRole(RoleType role, long parentId, double relevance) {
        if (relevance > closestRelevance) {
            closestRelevance = relevance
            closestParentId = parentId
        }
        if (role != RoleType.HIDDEN) {
            roles.add(new InterestRole(role : role, parentId : parentId, relevance : relevance))
        }
    }
}
