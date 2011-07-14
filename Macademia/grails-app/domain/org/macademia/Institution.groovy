package org.macademia

class Institution {

    public static final int TYPE_SCHOOL = 0
    public static final int TYPE_GROUP = 1

    String name
    String abbrev
    String emailDomain
    String webUrl

    Integer type = TYPE_SCHOOL

    static hasMany = [ institutionGroups : InstitutionGroup, memberships: Membership ]
    static belongsTo = InstitutionGroup

    static searchable = true

    static constraints = {
        abbrev(nullable: true)
        emailDomain(nullable: true)
        webUrl(unique: true)
        memberships(nullable: false)
    }

    public String toString() {
        return "$name"
    }

    public String toShortString() {
        return abbrev ? abbrev : name
    }

    public int compareTo(Object o) {
        if (Institution.class.isInstance(o)) {
            return webUrl.compareTo(((Institution)o).webUrl)
        } else {
            return -1;
        }
    }

    public boolean equals(Object p2) {
        return (compareTo(p2) == 0)
    }

    public int hashCode() {
        return webUrl.hashCode()
    }
}
