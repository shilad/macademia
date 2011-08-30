import org.macademia.*


InstitutionGroup.withTransaction {
    println('')
    while ( true ) {
        int i = readSelectionCode()
        if (i == 1) {
            createInstitution()
        } else if (i == 2) {
            createInstitutionGroup()
        } else if (i == 3) {
            addInstitutionsToGroup()
        } else if (i == 4) {
            println('Run Complete\n')
            break;
        } else {
            println("Invalid selection: $i\n")
        }
    }
}

int readSelectionCode() {
     return readText(
        """
Institution Group Management
Choose an option from the menu:
\t1) Create a new Institution
\t2) Create a new InstitutionGroup
\t3) Add an Institution to an existing InstitutionGroup
\t4) End
Enter number of selection:
        """) as int
}

void createInstitution() {
    InstitutionService institutionService = ctx.getBean("institutionService")

    def iText
    while(true) {
        iText = readText("""
Enter 'name, url, type, abbreviation, email domain'
Where name, url, and type are required
And type can be 'school' or 'group'.
        """)
        iText = iText.split(',').collect({it.trim() ? it.trim() : null})
        if (iText.size() != 5) {
            println("incorrect number of fields specified")
        } else if (!iText[0] || !iText[1] || !iText[2]) {
            println("first three fields are required")
        } else if (!['school', 'group'].contains(iText[2])) {
            println("invalid type field")
        } else {
            break
        }
        println("Error in input format.")
    }
    def (iName, iWebUrl, iType, iAbbrev, iEmailDomain) = iText
    iWebUrl = institutionService.normalizeWebUrl(iWebUrl)
    if (iType == 'school') {
        iType = Institution.TYPE_SCHOOL
    } else if (iType == 'group') {
        iType = Institution.TYPE_GROUP
    } else {
        throw new RuntimeException("Should never happen: ${iType}")
    }

    if( !Institution.findByWebUrl( iWebUrl ) ) {
        Institution i = new Institution(name : iName, webUrl: iWebUrl, abbrev: iAbbrev, type : iType, emailDomain : iEmailDomain)
        i.memberships = [] as Set
        InstitutionGroup all = InstitutionGroup.findByAbbrev('all')
        if (!all) {
            throw new IllegalStateException("all institution group does not exist")
        }
        all.addToInstitutions(i)
        i.addToInstitutionGroups(all)
        Utils.safeSave(i)
        Utils.safeSave(all)
    } else {
        println("\nInstitutionGroup with url $iWebUrl already exists. Choose another menu option: ")
    }
}

void createInstitutionGroup() {
    def igText
    while (true) {
        igText = readText( "Enter 'Name' of new InstitutionGroup and group 'Abbreviation', separated by a comma: " ).split(',')
        if (igText.size() == 2 ) {
            break
        }
        println("Error: Response must in the form 'Group, abbreviation' ")
    }
    def (igName, igAbbrev) = igText.collect({it.trim() ? it.trim() : null})
    igAbbrev = igAbbrev.toLowerCase()

    if( !InstitutionGroup.findByAbbrev( igAbbrev ) ) {
        ig = new InstitutionGroup(name : igName, abbrev : igAbbrev )
        Utils.safeSave(ig)
    } else {
        println("\nInstitutionGroup with Abbrev $igAbbrev already exists. Choose another menu option: ")
    }
}

void addInstitutionsToGroup() {
    // Handles case of adding an Institution to an existing IG. Checks if IG exists
    String igAbbrev = readText( "Enter group 'Abbreviation': " )
    ig = InstitutionGroup.findByAbbrev( igAbbrev )
    if (!ig) {
        println("no group with institution ${igAbbrev}")
        return
    }
    while( true ) {
        inputs = readText( "Enter name/domain of institution to add or 'end' " )
        if( inputs == 'end') {
            break
        }
        Institution school = Institution.findByEmailDomain( inputs )
        if ( !school ) {
            school = Institution.findByName( inputs )
        }
        if( !school ) {
            println("Error: No such institution found in database!")
        } else if(!ig.institutions || !ig.institutions.contains(school)){
            ig.addToInstitutions( school )
            school.addToInstitutionGroups(ig)
            Utils.safeSave( school )
        } else {
            println("Institution '${school.name}' is already a member of group '${ig.name}'!")
        }
    }
    Utils.safeSave(ig)
}

String readText(String prompt) {
    println( prompt )
    return System.console().readLine()
}