import pymongo
import sys

if len(sys.argv) != 4:
    sys.stderr.write('usage: %s host mongoDb interest\n')
    sys.exit(1)

(host, dbName, interest) = sys.argv[1:]

cnx = pymongo.Connection(host)
db = cnx[dbName]

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
    scores.append((score, name, id))

scores.sort()
scores.reverse()

print 'articles similar to %s (%s)' % (record['text'], record['_id'])
for (score, name, id) in scores:
    print '\t%.4f %s (%s)' % (score, name, id)
