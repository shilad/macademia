import org.macademia.Person
import org.macademia.nbrviz.PersonGraph


ctx.getBean('autocompleteService').init()
def similarityService = ctx.getBean('similarity2Service')
def sessionFactory = ctx.getBean('sessionFactory')
//Interest.list().each({
//    print("${it?.text}:")
//    for (Long iid : ss.chooseTopRelatedInterests(it.id, 7)) {
//        print(" ${Interest.get(iid)?.text}")
//    }
//    println("")
//})
def emails = [
    'ssen@macalester.edu'
]

def t1 = System.currentTimeMillis()
emails.each({
    def person = Person.findByEmail(it)
    PersonGraph graph = similarityService.calculatePersonNeighbors(person.id, 20, 5, [:])
    graph.prettyPrint()
    sessionFactory.currentSession.clear()
})
def t2 = System.currentTimeMillis()
println("elapsed time is ${t2 - t1}")
println("mean time is ${(t2 - t1) / emails.size()}")
