package org.macademia

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class CollaboratorRequest {

    String title
    String description
    Date dateCreated
    Date expiration
    static hasMany = [keywords : Interest]
    
    Person creator
    static mapping = {
        description type:'text'
    }
    
    public String toString() {
        return "$title ($creator?.fullName)"
    }

    public int compareTo(Object o2) {
        if (o2 instanceof CollaboratorRequest) {
            CollaboratorRequest other = o2 as CollaboratorRequest
            def titleCompare = other.title.compareTo(this.title)
            if (titleCompare == 0) {
                return dateCreated.compareTo(other.dateCreated)
            } else {
                return titleCompare
            }
        }
        throw new RuntimeException("Attempted to compare a CollaboratorRequest to a nonCollaboratorRequest object")
    }

    public boolean equals(Object other) {
        if (other instanceof CollaboratorRequest) {
            return (compareTo(other) == 0)
        }
        return false
    }

    public int hashCode() {
        return title.hashCode()
    }

}
