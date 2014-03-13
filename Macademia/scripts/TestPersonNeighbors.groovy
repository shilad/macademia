import gnu.trove.list.TIntList
import gnu.trove.list.array.TIntArrayList
import org.macademia.Person
import org.macademia.nbrviz.PersonGraph
import org.wikapidia.sr.SRResult
import org.wikapidia.sr.SRResultList
import org.macademia.graph.ClusterMap


//ctx.getBean('autocompleteService').init()
def wpService = ctx.getBean('wikAPIdiaService')
wpService.init()
def similarityService = ctx.getBean('similarity2Service')
def sessionFactory = ctx.getBean('sessionFactory')
def databaseService = ctx.getBean('databaseService')
def namer = ctx.getBean('entityNamerService')

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
    ClusterMap map = similarityService.buildPersonMap(person.id)
    println(map.dump(namer))
//    PersonGraph graph = similarityService.calculatePersonNeighbors(person.id, 20, 4, [:])
//    graph.prettyPrint()
//    SRResultList users = wpService.users.mostSimilarUsers(person.id, 300);
//    for (SRResult r : users) {
//        Person p = Person.get(r.id)
//        println("\t${r.score} person is: "  + p.fullName + " with " + p.interests.text)
//    }
//    List<Integer> roots = wpService.clusterer.findRoots(interestIds, users, 5);
})
def t2 = System.currentTimeMillis()
println("elapsed time is ${t2 - t1}")
println("mean time is ${(t2 - t1) / emails.size()}")
sessionFactory.currentSession.clear()
