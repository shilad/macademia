import org.macademia.Person
import org.macademia.nbrviz.PersonGraph
import org.wikapidia.sr.SRResult
import org.wikapidia.sr.SRResultList


//ctx.getBean('autocompleteService').init()
def wpService = ctx.getBean('wikAPIdiaService')
wpService.init()
def similarityService = ctx.getBean('similarity2Service')
def sessionFactory = ctx.getBean('sessionFactory')
def databaseService = ctx.getBean('databaseService')

databaseService.fillCache()

//Interest.list().each({
//    print("${it?.text}:")
//    for (Long iid : ss.chooseTopRelatedInterests(it.id, 7)) {
//        print(" ${Interest.get(iid)?.text}")
//    }
//    println("")
//})
def emails = [
    'ssen@macalester.edu',
    'shoop@macalester.edu',
    'fox@macalester.edu',
    'christiansen@macalester.edu',
]

def t1 = System.currentTimeMillis()
emails.each({
    def person = Person.findByEmail(it)
    println("matches for: " + person.interests*.text)
//    PersonGraph graph = similarityService.calculatePersonNeighbors(person.id, 20, 4, [:])
//    graph.prettyPrint()
    SRResultList users = wpService.fastSr.mostSimilarUsers(person.id, 300);
    for (SRResult r : users) {
        Person p = Person.get(r.id)
        println("\t${r.score} person is: "  + p.fullName + " with " + p.interests.text)
    }
    List<Integer> interestIds = person.interests*.id.collect({ it as int })
    List<Integer> roots = wpService.fastSr.findRoots(interestIds, users, 5);
})
def t2 = System.currentTimeMillis()
println("elapsed time is ${t2 - t1}")
println("mean time is ${(t2 - t1) / emails.size()}")
sessionFactory.currentSession.clear()
