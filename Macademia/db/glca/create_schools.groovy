import org.macademia.*

Institution.withTransaction {

def inst = InstitutionGroup.findByAbbrev('glca')
if (inst == null) {
    inst = new InstitutionGroup(name : 'Great Lakes College Association', abbrev : 'glca')
    inst.save(failOnError : true)
}
def institutions = [
    'albion.edu' : 'Albion College',
    'allegheny.edu' : 'Allegheny College',
    'antioch.edu' : 'Antioch College',
    'denison.edu' : 'Denison University',
    'depauw.edu' : 'DePauw University',
    'earlham.edu' : 'Earlham College',
    'hope.edu' : 'Hope College',
    'kzoo.edu' : 'Kalamazoo College',
    'kenyon.edu' : 'Kenyon College',
    'oberlin.edu' : 'Oberlin College',
    'owu.edu' : 'Ohio Wesleyan University',
    'wabash.edu' : 'Wabash College',
    'wooster.edu' : 'The College of Wooster',
    'glca.org' : 'The Great Lakes College Association'
]

def igroupAll = InstitutionGroup.findByAbbrev('all')
if (igroupAll == null ) {
    println('error: InstGroup \'all\' not found')
}
for (String domain : institutions.keySet()) {
    def college = Institution.findByEmailDomain(domain)
    if (college == null) {
        college = new Institution(name : institutions[domain], emailDomain: domain)
        inst.addToInstitutions(college)
        college.addToInstitutionGroups(inst)
        college.save(failOnError : true)
    }
    if( !igroupAll.institutions.contains(college) ) {
        igroupAll.addToInstitutions(college)
        college.addToInstitutionGroups(igroupAll)
        college.save(failOnError : true)
        println('Added ' + college.name +' to inst. group \'All\'')
    }
    if( !inst.institutions.contains(college) ) {
        inst.addToInstitutions(college)
        college.addToInstitutionGroups(inst)
        college.save(failOnError : true)
        println('Added ' + college.name +' to inst. group ' + inst.name)
    }
    if( college.emailDomain == 'owu.edu' ) {
        college.name = institutions[college.emailDomain]
        college.save( failOnError : true )
        println('Renamed OWU in the database')
    }

}
igroupAll.save(failOnError : true)
inst.save(failOnError : true)

}
