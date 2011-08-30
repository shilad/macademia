package org.macademia

import org.codehaus.groovy.grails.commons.ConfigurationHolder

class Person {
    public static final int USER_ROLE = 0
    public static final int INST_ADMIN_ROLE = 1
    public static final int ADMIN_ROLE = 2

    Date dateCreated
    Date lastUpdated
    String passwdHash
    String token
    String fullName
    String email
    String title
    String department
    String imageSubpath
    boolean enabled = true
    String links  // represented as a series of <li><a href="http://foo.com">foo</a></li> items
    
    int role = USER_ROLE
    boolean invisible = false

    static hasMany = [interests: Interest, memberships: Membership]
    static searchable = [only: ['fullName', 'email', 'department', 'invisible']]
    static constraints = {
        imageSubpath(nullable : true, blank:false)
        fullName(nullable: false, blank:false)
        email(nullable:false, blank:false, email: true, unique: true)
        token(nullable:false, blank:false, unique: true)
        links(nullable:true)
        department(nullable:true)
        title(nullable:true)
        invisible(nullable: false)
    }
    
    static mapping = {
        interests fetch: "join", cache: true
        links type:'text'
    }

    public String toString() {
        return "$fullName ($department)"
    }

    public int compareTo(Object p2) throws RuntimeException {
        if (p2 instanceof Person) {
            return email.compareTo(p2.email)
        } else {
            throw new RuntimeException("Attempted to compare a Person to a nonPerson object")
        }
    }

    public boolean equals(Object p2) {
        if (p2 instanceof Person) {
            return (compareTo(p2) == 0)
        }
        return false
    }

    public int hashCode() {
        return email.hashCode()
    }

    public String resetPasswd() {
        String passwd = randomString(10)
        passwdHash = calculatePasswdHash(passwd)
        return passwd
    }

    public boolean checkPasswd(String passwd) {
        return passwdHash == calculatePasswdHash(passwd)
    }

    public void updatePasswd(String passwd) {
        passwdHash = calculatePasswdHash(passwd)
    }

    public boolean isAdmin(Person other){
       return ((role == ADMIN_ROLE) || (role == INST_ADMIN_ROLE && other.memberOfAny(memberships.institution.id)))
    }

    public boolean canEdit(Person other) {
        if (id == other.id) {
            return true
        } else if (role == ADMIN_ROLE) {
            return true
        } else if (role == INST_ADMIN_ROLE && other.memberOfAny(memberships.institution.id)) {
            return true
        } else {
            return false
        }
    }

    public static String calculatePasswdHash(String passwd) {
        return ("" + (String)ConfigurationHolder.config.macademia.salt + passwd).encodeAsSHA256() 
    }


    public static String randomString(int n) {
        StringBuffer pw = new StringBuffer()
        Random r = new Random()
        for (int i=0; i < n; i++) {
            char c
            switch(r.nextInt(3)) {
            case 0:  c = ('0' as char ) +  (int)(Math.random() * 10); break;
            case 1:  c = ('a' as char ) +  (int)(Math.random() * 26); break;
            case 2:  c = ('A' as char ) +  (int)(Math.random() * 26); break;
            }
            pw.append(c)
        }
        return pw.toString()
    }

    private static final Set<String> IGNORED_FIELDS =
        new HashSet<String>([
                    'passwdHash',
                    'token',
                    'metaClass',
                    'hasMany',
                    'mapping',
                    'dirtyPropertyNames',
                    'version',
                    'errors',
                    'dirty',
                    'class',
                    'log',
                    'attached',
                    'searchable',
                    'constraints'
            ])

    public Map<String, String> toMap() {
        Map properties = this.properties
        Map<String, String> result = new HashMap<String, String>()
        for (String key : properties.keySet()) {
            if (IGNORED_FIELDS.contains(key)) {
                continue
            }
            if (key == 'interests') {
                result[key] = interests.collect({it.text}).join(", ")
            } else if (key == 'institution') {
                result[key] = memberships.institution.emailDomain
            } else {
                result[key] = '' + properties[key]
            }
        }
        return result
    }

    public String institutionsToString() {
        def result = retrievePrimaryInstitution().name
        def otherInstitutions = retrieveNonPrimaryInstitutions().toList()
        if (otherInstitutions.size() == 1){
            result += " and ${otherInstitutions[0].name}"
        } else if (otherInstitutions.size() >1) {
            for (int i =0; i < otherInstitutions.size()-1; i++){
                result += ", " + otherInstitutions[i].name
            }
            result += " and "+ otherInstitutions.last().name
        }
        return result
    }

    public Boolean memberOfAny(Collection<Long> institutionIds) {
        return institutionIds.any({memberships.institution.id.contains(it)})
    }

    public Boolean isMatch(InstitutionFilter filter) {
        return filter.matches(memberships.institution.id as Set)
    }

    def retrieveInstitutionGroups() {
        Collection<InstitutionGroup> igs = []
        for (Institution institution in memberships.institution){
            igs.addAll(institution.institutionGroups)
        }
        return igs
    }

    /**
     *
     * @return the primary institution of the person
     */
    public Institution retrievePrimaryInstitution() {
        return memberships.find({it.primaryMembership}).institution
    }

    /**
     *
     * @return a set of nonprimary institutions the person is in
     */
    public Set<Institution> retrieveNonPrimaryInstitutions(){
        return memberships.findAll({!it.primaryMembership}).institution
    }

}
