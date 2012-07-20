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

interests_by_normalized = {}                        # string normalized text -> interest
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

    def __str__(self):
        return '<user id=%d>' % self.id

    def __repr__(self):
        return '<user id=%d>' % self.id
        

class Interest: 
    def __init__(self, mongo_record):
        self.id = long(mongo_record['_id'])
        self.count = int(mongo_record['usage'])
        self.text = str(mongo_record['text'])
        self.sim_list = []
        self.sim_scores = {}
        self.sim_ranks = {}

        rank = 1
        #similar = mongo_record.get('similar')
        similar = mongo_record.get('similar2', mongo_record.get('similar'))
        for pair in similar.split('|'):
            if pair:
                tokens = pair.split(',')
                id = long(tokens[0])
                score = float(tokens[1])
                if not id in self.sim_scores:
                    self.sim_list.append(id)
                    self.sim_scores[id] = score
                    self.sim_ranks[id] = rank
                    rank += 1

    def replace_similar(self):
        new_sims = []
        new_scores = {}
        new_ranks = {}
        for id in self.sim_list:
            if id in interests_by_id:
                new_sims.append(interests_by_id[id])
                new_scores[interests_by_id[id]] = self.sim_scores[id]
                new_ranks[interests_by_id[id]] = self.sim_ranks[id]
        self.sim_list = new_sims
        self.sim_scores = new_scores
        self.sim_ranks = new_ranks

    def get_similar(self):
        if self in self.sim_list:
            return self.sim_list
        else:
            return [self] + self.sim_list

    def get_similarity_rank(self, i):
        if i == self:
            return 0
        else:
            return self.sim_ranks.get(i, 500)

    def get_similarity(self, i):
        if i == self:
            return 1.0
        else:
            return self.sim_scores.get(i, 0.0)

    "checks for a similarity score in either direction."
    def get_similarity2(self, i):
        if i == self:
            return 1.0
        elif i in self.sim_scores:
            return self.sim_scores[i]
        elif self in i.sim_scores:
            return i.sim_scores[self]
        else:
            return 0.0

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
        ntext = normalize(i.text)
        if not ntext in interests_by_normalized or interest_by_normalized[ntext].count < i.count:
            interests_by_normalized[ntext] = i

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
        users_by_id[u.id] = u
        for i in u.interests:
            users_by_interest[i].add(u)
        n_user_interests += len(u.interests)

    LOGGER.info('read %d users with %d interests', len(users_by_id), n_user_interests)

    normalize_scores()

def soft_truncate(s):
    # "soft" truncation shoving s >= 10 into [10,12) using a geometric series
    if s > 10:
        return 12 - 2 * (1 - 0.2) ** (s - 10.0)
    else:
        return s

def normalize_scores():
    for i in interests_by_name.values():
        for j in i.sim_scores:
            i.sim_scores[j] = soft_truncate(i.sim_scores[j])

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

def get_article_id_for_interest(interest):
    records = list(db.articlesToInterests.find(
                    {'interests' : re.compile('^%s,|,%s,' % (interest.id, interest.id))}))
    if len(records) == 0:
        return None
    else:
        if len(records) > 1:
            sys.stderr.write('too many matches for id %s: %s' % (id, `records`))
        return records[0]['_id']

def get_article_name_for_interest(interest):
    id = get_article_id_for_interest(interest)
    if id:
        name = get_article_name(id)
        if name:
            return name
    return 'Unknown'

def get_article_name(article_id):
    record = wp_db.articlesToIds.find_one({'wpId' : int(article_id)})
    if record:
        return record.get('_id')
    else:
        return None

def get_article_similarity_ranks(article_id, n=10000):
    record = wp_db.articleSimilarities.find_one({'_id' : int(article_id)})
    scores = {}
    if not record:
        LOGGER.warn('no interests for article id %s' % article_id)
        return scores
    for pair in record['similarities'].split('|')[:n]:
        if not pair:
            break
        tokens = pair.split(',')
        scores[tokens[0]] = len(scores) + 1
    return scores


def get_article_similarities(article_id, n=10000):
    record = wp_db.articleSimilarities.find_one({'_id' : int(article_id)})
    scores = {}
    if not record:
        LOGGER.warn('no interests for article id %s' % article_id)
        return scores
    for pair in record['similarities'].split('|')[:n]:
        if not pair:
            break
        tokens = pair.split(',')
        id = tokens[0]
        scores[id] = soft_truncate(float(tokens[1]))
    return scores

def get_correlation_matrix(interests):
    sims = collections.defaultdict(dict)
    for i in interests:
        sims[i][i] = 1.0
        for j in i.get_similar():
            sims[i][j] = i.get_similarity(j)
    return sims

def get_correlation_matrix5(interests):
    sims = {}

    for i in interests:
        article_id = get_article_id_for_interest(i)
        if article_id:
            sims[i] = {}
            for (article, rank) in get_article_similarity_ranks(article_id, 2000).items():
                sims[i][article] = math.log(rank + 10) / math.log(2)
        else:
            LOGGER.warn('no article id for interest %s' % i.text)
            sims[i] = {}
        if len(sims) % 100 == 0:
            LOGGER.info('loading similarities %s of %s', len(sims), len(interests)) 

    # use an inverted index for very big interest sets
    LOGGER.warn('building inverted index')
    interests_by_article = collections.defaultdict(dict)
    for (interest, interest_sims) in sims.items():
        for (article, sim) in interest_sims.items():
            interests_by_article[article][interest] = sim

    # calculate the length of each vector
    LOGGER.warn('calculating norms')
    norms = {}
    for (i, interest_sims) in sims.items():
        norms[i] = sum([sim*sim for sim in interest_sims.values()]) ** 0.5

    # calculate pearsons
    LOGGER.warn('calculating pairwise pearsons >= 0.003')
    sims2 = collections.defaultdict(lambda: collections.defaultdict(float))
    for (article, article_sims) in interests_by_article.items():
        for (i1, y1) in article_sims.items():
            for (i2, y2) in article_sims.items():
                sims2[i1][i2] += y1 * y2
    
    LOGGER.warn('rescaling pairwise pearsons')
    for (i1, i1_sims) in sims2.items():
        for i2 in i1_sims:
            sims2[i1][i2] /= (norms[i1]*norms[i2])

    return sims2
 
def get_correlation_matrix2(interests):
    sims = {}

    for i in interests:
        article_id = get_article_id_for_interest(i)
        if article_id:
            sims[i] = get_article_similarities(article_id, 2000)
        else:
            LOGGER.warn('no article id for interest %s' % i.text)
            sims[i] = {}

    sims2 = {}
    for i in sims:
        sims2[i] = {}
        for j in sims:
            isims = sims[i]
            jsims = sims[j]
            ii = 0.0
            jj = 0.0
            ij = 0.0
            for y in isims.values():
                ii += y * y
            for y in jsims.values():
                jj += y * y
            for (x, y) in isims.items():
                ij += y * jsims.get(x, 0.0)
            if ii == 0.0 or jj == 0.0:
                assert(ij == 0.0)
                sims2[i][j] = 0.0
            else:
                sims2[i][j] = ij / ((ii*jj)**0.5)
    return sims2
             
def get_correlation_matrix3(interests):
    sims = {}
    norms = {}

    for i in interests:
        article_id = get_article_id_for_interest(i)
        if article_id:
            sims[i] = get_article_similarities(article_id, 2000)
            norms[i] = sum([sim*sim for sim in sims[i].values()]) ** 0.5
        else:
            LOGGER.warn('no article id for interest %s' % i.text)
            sims[i] = {}

    sims2 = {}
    for i in sims:
        sims2[i] = {}
        for j in sims:
            n = 0
            for x in sims[i]:
                if x in sims[j]:
                    n += 1
            sims2[i][j] = n / (min([len(sims[i]), len(sims[j])]) + 20.0)
    return sims2
            
def get_correlation_matrix4(interests):
    lens = [50, 500, 2000]
    lens.sort() # sanity check
    sims = {}

    def get_top_sims(sim_dict, n):
        if len(sim_dict) <= n:
            return sim_dict
        else:
            items = sim_dict.items()
            items.sort(key=lambda pair: pair[1])
            items.reverse()
            return dict(items[:n])

    for i in interests:
        article_id = get_article_id_for_interest(i)
        if article_id:
            sims[i] = get_article_similarities(article_id, lens[-1])
        else:
            LOGGER.warn('no article id for interest %s' % i.text)
            sims[i] = {}

    sims2 = collections.defaultdict(lambda: collections.defaultdict(float))
    for l in lens:
        for i in sims:
            isims = get_top_sims(sims[i], l)
            for j in sims:
                jsims = get_top_sims(sims[j], l)
                assert(len(isims) <= l and len(jsims) <= l)
                n = 0
                for x in isims:
                    if x in jsims:
                        n += 1
                mean_sim = n / (min([len(isims), len(jsims)]) + 20.0)
                sims2[i][j] += mean_sim / len(lens)
    return sims2
            
def get_users_with_interest(interest):
    return users_by_interest[interest]

def get_user_by_id(id):
    return users_by_id[id]

def get_interest_by_name(name):
    return interests_by_name.get(name.lower())

def get_interest_by_normalized_text(text):
    return interests_by_normalized.get(normalize(text))

def get_interest_by_id(id):
    return interests_by_id.get(long(id))

def get_all_interests():
    return interests_by_id.values()

def get_all_users():
    return users_by_id.values()

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def test():
    init()

NORMALIZE_PATTERN = re.compile('[\W_]+')

def normalize(text):
    return NORMALIZE_PATTERN.sub('', text).lower()

def mean(l):
    return 1.0 * sum(l) / len(l)

def disambiguateArticle(id, steps=0):
    idRecord = wp_db.articlesToIds.find_one({'wpId' : id})
    if not idRecord or steps > 5:
        return None
    if 'red' in idRecord:
        return disambiguateArticle(wp_db, idRecord['red'], steps+1)
    elif 'dab' in idRecord:
        bestRecord = None
        for id in idRecord['dab']:
            rec = wp_db.articlesToIds.find_one({'wpId' : id})
            if not bestRecord or rec.get('count', 0) > bestRecord['count']:
                bestRecord = rec
        return bestRecord
    else:
        return idRecord

def read_gold_standard(path):
    # weighted adjacency matrix
    counts = collections.defaultdict(lambda: collections.defaultdict(int))
    for line in open(path):
        for id1 in line.split():
            for id2 in line.split():
                if id1 != id2:
                    i1 = get_interest_by_id(id1)
                    i2 = get_interest_by_id(id2)
                    if i1 and i2:
                        counts[i1][i2] += 1
    return counts

def read_gold_sessions(path):
    # weighted adjacency matrix
    sessions = []
    for line in open(path):
        interests = [get_interest_by_id(id) for id in line.split()]
        sessions.append([i for i in interests if i])
    return sessions

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    test()
