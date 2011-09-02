import math
import pymongo
import random
import sys

overallSimCount = 0
overallSimSum = 0

def main(db, n):
    for id in getRandomInterestIds(db, n):
        doInterest(db, id)

def normalizeScores(tuples):
    if not tuples:
        return
    sigmoid = lambda x: 1.0 / (1.0 + math.exp(-x))
    #topScore = tuples[0][0] ** 0.5
    #normalizedTopScore = 1.0 / (1.0 + math.exp(-topScore))
    #print 'score went from', topScore, normalizedTopScore
    #factor = normalizedTopScore / topScore
    #print 'factor is', factor
    for t in tuples:
        t[0] = sigmoid((t[0] - 0.15) * 4)

def getRandomInterestIds(db, n):
    ids = [r['_id'] for r in db.interests.find({}, {'_id' : 1 })]
    return random.sample(ids, n)

def getInterestName(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('text')

def doInterest(db, id):
    global overallSimCount
    global overallSimSum

    record = db.interests.find_one({'_id' : id})
    if not record.get('text'):
        print 'skipping', id, 'without text attribute'
        return
    scores = []
    for pair in record['similar'].split('|'):
        if not pair:
            break
        tokens = pair.split(',')
        id = long(tokens[0])
        score = float(tokens[1])
        name = getInterestName(db, id)
        scores.append([score, name, id])

    scores.sort()
    scores.reverse()
    if len(scores) >= 5:
        overallSimCount += 1
        overallSimSum += scores[2][0]
    normalizeScores(scores)

    print 'interests similar to %s (%s)' % (record['text'], record['_id'])
    i = 0
    nextShown = 1
    for (score, name, id) in scores:
        i += 1
        if i == nextShown:
            nextShown *= 2
            print '\t%d: %.4f %s (%s)' % (i, score, name, id)

if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.stderr.write('usage: %s host mongoDb numInterests\n' % sys.argv[0])
        sys.exit(1)
    
    (host, dbName, numInterests) = sys.argv[1:]
    cnx = pymongo.Connection(host)
    db = cnx[dbName]
    numInterests = int(numInterests)
    main(db, numInterests)

    print 'mean is' + str(1.0 / (overallSimCount / overallSimSum))
