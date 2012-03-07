import org.macademia.Interest
import org.macademia.nbrviz.QueryGraph
import org.macademia.nbrviz.InterestGraph


ctx.getBean('autocompleteService').init()
def similarityService = ctx.getBean('similarity2Service')
def sessionFactory = ctx.getBean('sessionFactory')
def databaseService = ctx.getBean('databaseService')

databaseService.fillCache()
def queries = [
    'web20',
    'anthropology',
    'music',
    'geography',
    'jazz',
    'economics',
]

def t1 = System.currentTimeMillis()
queries.each({
    println("interest graph for ${it}")
    def interest = Interest.findByNormalizedText(it)
    InterestGraph graph = similarityService.calculateInterestNeighbors(interest.id, 20, 5, [:])
    graph.prettyPrint()
    sessionFactory.currentSession.clear()
})
def t2 = System.currentTimeMillis()
println("elapsed time is ${t2 - t1}")
println("mean time is ${(t2 - t1) / queries.size()}")
