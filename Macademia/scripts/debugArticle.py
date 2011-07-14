import pymongo
import re
import sys

if len(sys.argv) != 4:
    sys.stderr.write('usage: %s host mongoDb articleName\n')
    sys.exit(1)

(host, dbName, articleName) = sys.argv[1:]

cnx = pymongo.Connection(host)
db = cnx[dbName]

def getArticleName(db, id):
    record = db.articlesToIds.find_one({'wpId' : id})
    if record:
        return record.get('_id')

idRecord = db.articlesToIds.find_one({'_id' : re.compile('^' + articleName + '$', re.IGNORECASE)})
simRecord = db.articleSimilarities.find_one({'_id' : idRecord['wpId']})

print 'articles similar to %s (%s)' % (idRecord['_id'], idRecord['wpId'])
scores = []
for pair in simRecord['similarities'].split('|'):
    if not pair:
        break
    tokens = pair.split(',')
    id = tokens[0]
    score = float(tokens[1])
    name = getArticleName(db, id)
    print u'\t%.4f %s (%s)' % (score, `name`, id)
