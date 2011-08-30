package org.macademia;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents an institution filter for Macademia.
 * The institutions must:
 * - match the requiredInstitutionId (if it is not null)
 * - match at least one of institutionIds
 */
public class InstitutionFilter {
    public Set<Long> institutionIds = null;
    public Long requiredInstitutionId = null;

    public InstitutionFilter(Set<Long> institutionIds, Long requiredInstitutionId) {
        this.institutionIds = institutionIds;
        this.requiredInstitutionId = requiredInstitutionId;
    }

    public InstitutionFilter(Set<Long> institutionIds) {
        this.institutionIds = institutionIds;
    }

    public boolean matches(Set<Long> queryIds) {
        if (requiredInstitutionId != null && !queryIds.contains(requiredInstitutionId)) {
            return false;
        }
        return Utils.collectionsOverlap(queryIds, institutionIds);
    }
}
