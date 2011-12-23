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
wp_db = None

LOGGER = logging.getLogger(__name__)

interests_by_name = {}                              # string name -> interest
interests_by_id = {}                                # long interest id -> interest

users_by_id = {}                                    # long user id -> user 
users_by_interest = collections.defaultdict(set)    # interest -> set of users with interests

class User:
    def __init__(self, mongo_record):
        self.id = long(mongo_record['_id'])
        self.interests = set()
        self.cluster_counts = collections.defaultdict(int)
        for iid in mongo_record['interests']:
            if long(iid) in interests_by_id:
                self.interests.add(interests_by_id[long(iid)])

    def set_cluster_counts(self, closest_clusters):
        self.cluster_counts.clear()
        for i in self.interests:
            c = closest_clusters.get(i) # c may be None
            self.cluster_counts[c] += 1

    def get_cluster_counts(self):
        return self.cluster_counts

    def get_cluster_for_interest(self, i):
        return self.cluster_interests[i]

    def get_primary_clusters(self):
        if not self.cluster_counts:
            return []
        if len(self.cluster_counts) == 1 and None in self.cluster_counts:
            return []
        max_count = max(n for (c, n) in self.cluster_counts.items() if c != None)
        return [c for c in self.cluster_counts if self.cluster_counts[c] == max_count]
        

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
        if self in self.sim_list:
            return self.sim_list
        else:
            return [self] + self.sim_list

    def get_similarity(self, i):
        if i == self:
            return 0.4
        else:
            return self.sim_scores.get(i, 0.0)

    def get_capped_similarity(self, i):
        return min(0.07, self.get_similarity(i))

    def __repr__(self):
        return str(self)

    def __str__(self):
        return ('<id=%s text=%s count=%d nsims=%d>' %
                    (`self.id`, `self.text`, self.count, len(self.sim_list)))

def init(config={}):
    global HOST, DB_NAME, WP_DB_NAME
    global db, wp_db
    global interests_by_name, interests_by_id

    HOST = config.get('host', HOST)
    DB_NAME = config.get('db_name', DB_NAME)
    WP_DB_NAME = config.get('wp_db_name', WP_DB_NAME)
    cnx = pymongo.Connection(HOST)
    db = cnx[DB_NAME]
    wp_db = cnx[WP_DB_NAME]

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

    LOGGER.info('incrementing count for interests exactly matching WP titles...')
    incr_count_for_matching_titles()

    n_user_interests = 0
    for record in db.users.find():
        u = User(record)
        users_by_id[i.id] = u
        for i in u.interests:
            users_by_interest[i].add(u)
        n_user_interests += len(u.interests)

    LOGGER.info('read %d users with %d interests', len(users_by_id), n_user_interests)

    #normalize()


def normalize():
    scores = []
    for i in interests_by_name.values():
        scores.extend(i.sim_scores.values())
    scores.sort()
    offset = scores[4 * len(scores) / 5]
    for i in interests_by_name.values():
        for j in i.sim_scores:
            i.sim_scores[j] += offset

def incr_count_for_matching_titles():
    global db, wp_db

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

def get_users_with_interest(interest):
    return users_by_interest[interest]

def get_user_by_id(id):
    return users_by_id[id]

def get_interest_by_name(name):
    return interests_by_name.get(name.lower())

def get_interest_by_id(id):
    return interests_by_id.get(long(id))

def get_all_interests():
    return interests_by_id.values()

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def test():
    init()

NORMALIZE_PATTERN = re.compile('[\W_]+')

def normalize(text):
    return NORMALIZE_PATTERN.sub('', text).lower()

def mean(l):
    return 1.0 * sum(l) / len(l)

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
