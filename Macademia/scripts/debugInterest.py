import pymongo
import sys

if len(sys.argv) not in (4, 5):
    sys.stderr.write('usage: %s host mongoDb interest {num-results}\n')
    sys.exit(1)

(host, dbName, interest) = sys.argv[1:4]
numInterests = 100
if len(sys.argv) == 5:
    numInterests = int(sys.argv[4])

cnx = pymongo.Connection(host)
db = cnx[dbName]

def getInterestCount(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('usage')

def getInterestName(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('text')

record = db.interests.find_one({'text' : interest})
print 'raw:', record['similar'][:100]
scores = []
for pair in record['similar'].split('|'):
    if not pair:
        break
    tokens = pair.split(',')
    id = long(tokens[0])
    score = float(tokens[1])
    name = getInterestName(db, id)
    count = getInterestCount(db, id)
    scores.append((score, name, count, id))

scores.sort()
scores.reverse()

print 'articles similar to %s (%s)' % (record['text'], record['_id'])
for (score, name, count, id) in scores:
    print '\t%.4f %s (%s, n=%s)' % (score, name, id, count)
