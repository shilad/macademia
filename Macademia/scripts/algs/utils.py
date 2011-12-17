import collections
import logging
import math
import pymongo
import re
import sys

HOST = 'localhost'
DB_NAME = 'macademia_prod'
WP_DB_NAME = 'wikipediaReadOnly'
db = None

LOGGER = logging.getLogger(__name__)

interests_by_name = {}    # string name -> interest
interests_by_id = {}      # long id -> interest


class Interest: 
    def __init__(self, mongo_record):
        self.id = long(mongo_record['_id'])
        self.count = int(mongo_record['usage'])
        self.text = str(mongo_record['text'])
        self.sim_list = []
        self.sim_scores = {}

        for pair in mongo_record['similar'].split('|'):
            if pair:
                tokens = pair.split(',')
                id = long(tokens[0])
                score = float(tokens[1])
                if not id in self.sim_scores:
                    self.sim_list.append(id)
                    self.sim_scores[id] = score

    def replace_similar(self):
        new_sims = []
        new_scores = {}
        for id in self.sim_list:
            if id in interests_by_id:
                new_sims.append(interests_by_id[id])
                new_scores[interests_by_id[id]] = self.sim_scores[id]
        self.sim_list = new_sims
        self.sim_scores = new_scores

    def get_similar(self):
        return self.sim_list

    def get_similarity(self, i):
        return self.sim_scores.get(i, 0.0)

    def __repr__(self):
        return str(self)

    def __str__(self):
        return ('<id=%s text=%s count=%d nsims=%d>' %
                    (`self.id`, `self.text`, self.count, len(self.sim_list)))

def init(config={}):
    global db, HOST, DB_NAME
    global interests_by_name, interests_by_id

    HOST = config.get('host', HOST)
    DB_NAME = config.get('db_name', DB_NAME)
    cnx = pymongo.Connection(HOST)
    db = cnx[DB_NAME]

    LOGGER.info('reading interests...')
    for record in db.interests.find():
        i = Interest(record)
        interests_by_id[i.id] = i
        interests_by_name[i.text] = i

    num_sims = 0
    for i in interests_by_name.values():
        i.replace_similar()
        num_sims += len(i.sim_list)

    LOGGER.info('read %d interests and %d sims (mean %.3f)...',
            len(interests_by_name), num_sims, 1.0 * num_sims / len(interests_by_name)
        )

    #normalize()
    incr_count_for_matching_titles(cnx)


def normalize():
    scores = []
    for i in interests_by_name.values():
        scores.extend(i.sim_scores.values())
    scores.sort()
    offset = scores[4 * len(scores) / 5]
    for i in interests_by_name.values():
        for j in i.sim_scores:
            i.sim_scores[j] += offset

def incr_count_for_matching_titles(cnx):
    db = cnx[DB_NAME]
    wp_db = cnx[WP_DB_NAME]

    num_matches = 0
    for record in db.articlesToInterests.find():
        wp_id = str(record['_id'])
        interest_ids = [long(id) for id in record['interests'].split(',') if id]
        record = wp_db.articlesToIds.find_one({'wpId' : wp_id})
        if not record:
            continue
        title = normalize(record.get('_id', ''))
        for iid in interest_ids:
            i = interests_by_id.get(iid)
            if i and normalize(i.text) == title:
                i.count += 1
                num_matches += 1
    LOGGER.debug('incremented count for %d matching titles' % num_matches)

def getInterestByName(name):
    return interests_by_name.get(name.lower())

def getInterestById(id):
    return interests_by_id.get(long(id))

def getAllInterests():
    return interests_by_id.values()

def getInterestCount(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('usage')
    else:
        return 0

def getInterestName(db, id):
    record = db.interests.find_one({'_id' : id})
    if record:
        return record.get('text')

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def test():
    init()

NORMALIZE_PATTERN = re.compile('[\W_]+')

def normalize(text):
    return NORMALIZE_PATTERN.sub('', text).lower()


def read_gold_standard(path):
    # weighted adjacency matrix
    counts = collections.defaultdict(lambda: collections.defaultdict(int))
    for line in open(path):
        for id1 in line.split():
            for id2 in line.split():
                if id1 != id2:
                    i1 = getInterestById(id1)
                    i2 = getInterestById(id2)
                    if i1 and i2:
                        counts[i1][i2] += 1
    return counts

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    test()
