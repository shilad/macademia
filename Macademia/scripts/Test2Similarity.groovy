import org.macademia.Interest


def similarityService = ctx.getBean('similarity2Service')
def sessionFactory = ctx.getBean('sessionFactory')
def queries = [
    ['web20', 'music'],
    ['politicalscience', 'economics'],
]

def t1 = System.currentTimeMillis()
queries.each({
    def queryIds = it.collect({Interest.findByNormalizedText(it).id})
    similarityService.calculateQueryNeighbors(new HashSet(queryIds), 30)
    similarityService.calculateQueryNeighbors(new HashSet(queryIds), 30)
    sessionFactory.currentSession.clear()
})
def t2 = System.currentTimeMillis()
println("elapsed time is ${t2 - t1}")
println("mean time is ${(t2 - t1) / queries.size()}")
