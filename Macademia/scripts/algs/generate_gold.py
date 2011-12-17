import pymongo
import string
import sys

host = 'localhost'
dbName = 'macademia_prod'

cnx = pymongo.Connection(host)
db = cnx[dbName]

def getInterestName(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('text')

def gold_sessions():
    for record in db.sessionLog.find():
        interests = set()
        for event in record['log']:
            if ((event['category'] == 'nav')
            and (event['event'] == 'fragment')
            and (event['params'].get('interestId'))):
                interests.add(event['params']['interestId'])
        print string.join(interests)

def gold_tooltips():
    for record in db.sessionLog.find():
        interests = set()
        for event in record['log']:
            params = event['params']
            if ((event['category'] == 'nav')
            and (event['event'] == 'fragment')
            and (params.get('interestId'))):
                interests.add(event['params']['interestId'])

            if ((event['category'] == 'nav')
            and (event['event'] == 'fragment')
            and (params.get('nodeId', '').startswith('i_'))):
                interests.add(event['params']['nodeId'][2:])

            if ((event['category'] == 'tooltip')
            and (params.get('node', '').startswith('i_'))):
                id1 = event['node'][2:]
                interests.add(id1)

        if interests:
            print string.join(interests)

gold_tooltips()
