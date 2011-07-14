package org.macademia

/**
 * The Edge class represents an edge on a graph. There are three types of edges:
 * Person to Interest edges, Interest to Related Interest, and Person to Interest
 * through the Related Interest or intermediary. If any of the fields are not
 * involved in the edge they are null
 *
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class Edge {

    Long personId
    Long interestId
    Long requestId
    Long relatedInterestId

    Person person
    Interest interest
    CollaboratorRequest request
    Interest relatedInterest

    double sim

    public void reify() {
        if (personId != null) {
            this.person = Person.get(personId)
        }
        if (interestId != null) {
            this.interest = Interest.get(interestId)
        }
        if (relatedInterestId != null) {
            this.relatedInterest = Interest.get(relatedInterestId)
        }
        if (requestId != null) {
            this.request = CollaboratorRequest.get(requestId)
        }
    }

    public boolean equals(Object other) {
        if (Edge.class.isInstance(other)) {
            return ((personId == other.personId && interestId == other.interestId && relatedInterestId == other.relatedInterestId && requestId == other.requestId)
            ||     (requestId == other.requestId && personId == other.personId && relatedInterestId == other.interestId && interestId == other.relatedInterestId))
        }
        return false
    }

    public int hashCode() {
        if (personId != null) {
            if (relatedInterestId != null) {
                return personId * interestId * relatedInterestId
            }
            return personId * interestId
        } else if (requestId != null) {
            if (relatedInterestId != null) {
                return requestId * relatedInterestId * interestId
            }
            return requestId * interestId
        }
        return interestId * relatedInterestId
    }

    public String toString() {
        return "Edge with person $person, interest $interest, collaborator request $request, and related interest $relatedInterest"
    }

    public boolean hasSharedInterest() {
        return (relatedInterestId != null)
    }

    public boolean hasRelatedInterest() {
        return (relatedInterestId != null)
    }

    public void setPerson(Person p) {
        this.person = p
        this.personId = p.id
    }

    public void setRequest(CollaboratorRequest r) {
        this.request = r
        this.requestId = r.id
    }

    public void setRelatedInterest(Interest i) {
        this.relatedInterest = i
        this.relatedInterestId = i.id
    }

    public void setInterest(Interest i) {
        this.interest = interest
        this.interestId = i.id
    }
}
