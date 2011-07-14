import org.macademia.*

Institution.withTransaction {

def bow = InstitutionGroup.findByAbbrev('bow')
if (bow == null) {
    bow = new InstitutionGroup(name : 'Bow 3 Colleges', abbrev : 'bow')
    bow.save(failOnError : true)
}
def babson = Institution.findByEmailDomain('babson.edu')
if (babson == null) {
    babson = new Institution(name : 'Babson College', emailDomain: 'babson.edu')
    bow.addToInstitutions(babson)
    babson.addToInstitutionGroups(bow)
    babson.save(failOnError : true)
}
def wellesley = Institution.findByEmailDomain('wellesley.edu')
if (wellesley == null) {
    wellesley = new Institution(name : 'Wellesley College', emailDomain: 'wellesley.edu')
    bow.addToInstitutions(wellesley)
    wellesley.addToInstitutionGroups(bow)
    wellesley.save(failOnError : true)
}
def olin = Institution.findByEmailDomain('olin.edu')
if (olin == null) {
    olin = new Institution(name : 'Olin College', emailDomain: 'olin.edu')
    bow.addToInstitutions(olin)
    olin.addToInstitutionGroups(bow)
    olin.save(failOnError : true)
}
bow.save(failOnError : true)

}
