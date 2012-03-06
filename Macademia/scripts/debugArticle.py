import pymongo
import re
import sys

if len(sys.argv) != 2:
    sys.stderr.write('usage: %s host mongoDb articleName\n')
    sys.exit(1)

articleName = sys.argv[1]

cnx = pymongo.Connection('localhost')
db = cnx['wikipediaReadOnly']

def disambiguateArticle(db, id, steps=0):
    idRecord = db.articlesToIds.find_one({'wpId' : id})
    if not idRecord or steps > 5:
        return None
    if 'red' in idRecord:
        return disambiguateArticle(db, idRecord['red'], steps+1)
    elif 'dab' in idRecord:
        bestRecord = None
        for id in idRecord['dab']:
            rec = db.articlesToIds.find_one({'wpId' : id})
            if not bestRecord or rec.get('count', 0) > bestRecord['count']:
                bestRecord = rec
        return bestRecord
    else:
        return idRecord
    
def getArticleName(db, id):
    record = db.articlesToIds.find_one({'wpId' : int(id)})
    if record:
        return record.get('_id')

idRecord = db.articlesToIds.find_one({'_id' : articleName})
if not idRecord:
    print 'no article found with name %s' % `articleName`
    sys.exit(1)

idRecord = disambiguateArticle(db, idRecord['wpId'], 0)
simRecord = db.articleSimilarities.find_one({'_id' : idRecord['wpId']})

print 'idRecord is %s' % `idRecord`
print 'articles similar to %s (%s, %s)' % (idRecord['_id'], idRecord['wpId'], simRecord['flags'])
scores = []
for pair in simRecord['similarities'].split('|'):
    if not pair:
        break
    tokens = pair.split(',')
    id = tokens[0]
    score = float(tokens[1])
    name = getArticleName(db, id)
    print u'\t%.4f %s (%s)' % (score, `name`, id)
