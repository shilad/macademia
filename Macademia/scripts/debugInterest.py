import pymongo
import re
import sys

if len(sys.argv) not in (2, 3):
    sys.stderr.write('usage: %s interest {num-results}\n')
    sys.exit(1)


interest = sys.argv[1]
numInterests = 100
if len(sys.argv) == 3:
    numInterests = int(sys.argv[2])

wp_db = pymongo.Connection('localhost')['wikipediaReadOnly']
mac_db = pymongo.Connection('localhost')['macademia_prod']

def getInterestCount(id):
    record = mac_db.interests.find_one({'_id' : id})
    if record:
        return record.get('usage')

def getArticleName(id):
    record = wp_db.articlesToIds.find_one({'wpId' : int(id)})
    if record:
        return record.get('_id')

def getInterestArticle(id):
    records = list(mac_db.articlesToInterests.find(
                    {'interests' : re.compile('^%s,|,%s,' % (id, id))}))
    if len(records) == 0:
        return 'Unknown'
    elif len(records) >= 1:
        if len(records) > 1:
            sys.stderr.write('too many matches for id %s: %s' % (id, `records`))
        for wpId in [r['_id'] for r in records]:
            name = getArticleName(wpId)
            if name:
                return name
        return 'Unknown'

def getInterestName(id):
    record = mac_db.interests.find_one({'_id' : id})
    if record:
        return record.get('text')

record = mac_db.interests.find_one({'text' : interest})
if not record:
    print 'no information about interest', interest
    sys.exit(1)

id = record['_id']
n = record.get('count', 0)
print 'interests similar to %s (id=%d, n=%d, article=%s)' % (interest, id, n, getInterestArticle(id))

scores = []
for pair in record['similar2'].split('|'):
    if not pair:
        break
    tokens = pair.split(',')
    id = long(tokens[0])
    score = float(tokens[1])
    name = getInterestName(id)
    count = getInterestCount(id)
    article = getInterestArticle(id)
    scores.append((score, name, count, id, article))

scores.sort()
scores.reverse()

for (score, name, count, id, article) in scores:
    print '\t%.4f %s (%s, n=%s, article=%s)' % (score, name, id, count, `article`)
