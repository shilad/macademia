package org.macademia

class InstitutionGroup {
    String name
    String abbrev
    Boolean crossCutting = false

    static hasMany = [ institutions : Institution ]
    static mapping = {
        institutions batchSize: 100
    }

    static constraints = {
        abbrev(unique: true)
    }

    public String toString() {
        return "$name ($abbrev)"
    }

    public int compareTo(Object o2) throws RuntimeException {
        if (o2 instanceof InstitutionGroup) {
            return abbrev.compareTo(o2.abbrev)
        } else {
            throw new RuntimeException("Attempted to compare an InstitutionGroup to a nonInstitutionGroup object")
        }
    }

    public boolean equals(Object o2) {
        if (o2 instanceof InstitutionGroup) {
            return (compareTo(o2) == 0)
        }
        return false
    }

    public int hashCode() {
        return abbrev.hashCode()
    }

}
