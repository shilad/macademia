package org.macademia

class Membership {

    Person person
    Institution institution
    Boolean primaryMembership = false

    static belongsTo = Person

    public String toString() {
        return "$person is a member of $institution"
    }

    public int compareTo(Object o2) throws RuntimeException {
        if (o2 instanceof Membership) {
            Membership other = o2 as Membership
            if (other.primaryMembership && this.primaryMembership) {
                return 0
            } else if (other.primaryMembership) {
                return -1
            }
            int personCompare = other.person.compareTo(this.person)
            if (personCompare == 0) {
                return other.institution.compareTo(this.institution)
            } else {
                return personCompare
            }
        } else {
            throw new RuntimeException("Attempted to compare a Membership to a nonMembership object")
        }
    }

    public boolean equals(Object o2) {
        if (o2 instanceof Membership) {
            return (compareTo(o2) == 0)
        }
        return false
    }

    public int hashCode() {
        return person.hashCode() + institution.hashCode()
    }

}
