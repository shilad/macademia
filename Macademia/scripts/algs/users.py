import collections
import logging
import random

import clusters
import utils

MAX_CLUSTERS = 4
NUM_USERS = 20
MIN_USERS_PER_CLUSTER = 2

LOGGER = logging.getLogger(__name__)

def make_full_person_graph(root_user):
    LOGGER.debug('user interests are %s', ([i.text for i in root_user.interests if len(i.sim_list) > 1]))
    clusters = [set([i]) for i in root_user.interests]
    
    while merge_one_pair(clusters):
        pass

def merge_one_pair(clusters):
    best_sim = 0.0
    best_pair = None
    for c1 in clusters:
        for c2 in clusters:
            if c1 == c2:
                continue
            sim = cluster_sim(c1, c2)
            if sim > best_sim:
                best_sim = sim
                best_pair = (c1, c2)
    if not best_pair:
        return False
    (c1, c2) = best_pair
    LOGGER.debug('merging %s and %s', [i.text for i in c1], [i.text for i in c2])
    clusters.remove(c1)
    clusters.remove(c2)
    c1.update(c2)
    return True

def cluster_sim(c1, c2):
    sim = 0.0
    for i1 in c1:
        for i2 in c2:
            sim += 1.0 / i1.get_similarity_rank(i2)
            sim += 1.0 / i2.get_similarity_rank(i1)
    return sim / (len(c1) * len(c2))
            

def make_full_interest_graph(root_interest):
    cluster_map = clusters.make_interest_graph(root_interest)
    closest_clusters = find_closest_clusters(cluster_map['map'].keys())
    candidates = set()
       
    for root in cluster_map['map']:
        for i in [root] + root.get_similar():
            for u in utils.get_users_with_interest(i):
                if u not in candidates:
                    u.set_cluster_counts(closest_clusters)
                    candidates.add(u)

    LOGGER.debug('found %d candidates for interest %s' % (len(candidates), root_interest))

    closest_counts = collections.defaultdict(int)
    for u in candidates:
        primary = u.get_primary_clusters()
        if len(primary) == 1:
            closest_counts[primary[0]] += 1

    LOGGER.debug('scoring candidates...')
    weights = {}
    for i in cluster_map['map']:
        weights[i] = (2.0 if i == root_interest else 0.5)
    scores = {}
    for u in candidates:
        scores[u] = get_relevance(u, closest_clusters, weights)
    LOGGER.debug('finished scoring candidates...')

    DECAY = 0.7
    weights = collections.defaultdict(lambda: 2.0)
    results = []
    while candidates and len(results) < NUM_USERS:
        u = choose_candidate(candidates, scores, weights)
        candidates.remove(u)
        results.append(u)
        primaries = u.get_primary_clusters()
        for c in primaries:
            weights[c] *= (1.0 - (1.0 - DECAY) / len(primaries))

    for u in results:
        show_candidate(u, closest_clusters, weights, scores[u])

def choose_candidate(candidates, scores, weights):
    top_score = 0
    top_user = None
    for user in candidates:
        score = scores[user]
        primaries = user.get_primary_clusters()
        if primaries:
            weight = utils.mean([weights[c] for c in primaries])
            score *= weight
            if score > top_score:
                top_score = score
                top_user = user
    return top_user

CLUSTER_PENALTY = 0.7

def show_candidate(candidate, closest_clusters, weights, relevance):
    interests_by_cluster = collections.defaultdict(list)
    for i in candidate.interests:
        c = closest_clusters.get(i)
        sim = 0.0 if c == None else c.get_capped_similarity(i)
        interests_by_cluster[c].append((sim, i))
    
    cluster_scores = collections.defaultdict(float)
    for c in interests_by_cluster:
        if c == None:
            continue
        ibc = interests_by_cluster[c]
        ibc.sort()
        ibc.reverse()       # by decreasing score
        penalty = 1.0
        for (sim, i) in ibc:
            cluster_scores[c] += penalty * sim * weights[c]
            penalty *= CLUSTER_PENALTY
    
    clusters = list(cluster_scores.keys())
    clusters.sort(lambda c1, c2: -1*cmp(cluster_scores[c1], cluster_scores[c2]))

    print '%s relevance %.2f:' % (candidate.id, relevance)
    primaries = candidate.get_primary_clusters()
    for c in clusters:
        name = c.text if c else 'None'
        scores_and_names = [
            ('%.3f: %s' % (s, i.text))
            for (s, i) in interests_by_cluster[c]
        ]
        if c in primaries: name += '*'
        print ('\t%.2f %s (n=%d, w=%.1f): %s' %
            (cluster_scores[c], name, len(scores_and_names), weights[c], `scores_and_names`))
    print

def get_relevance(candidate, closest_clusters, weights):
    penalties = collections.defaultdict(lambda : 1.0)
    score = 0.0
    for i in candidate.interests:
        c = closest_clusters.get(i)
        if c:
            score += weights[c] * c.get_capped_similarity(i) * penalties[c]
            penalties[c] *= CLUSTER_PENALTY
    return score

def find_closest_clusters(interests):
    closest = {}
    closest_scores = collections.defaultdict(float)
    for i in interests:
        closest[i] = i
        closest_scores[i] = 10000000000000.0
        for j in i.get_similar():
            s = j.get_similarity(i)
            if s and s > closest_scores[j]:
                closest[j] = i
                closest_scores[j] = s
    return closest

def test_graph():
    i = utils.get_interest_by_name('politics')
    make_full_interest_graph(i)
        
def test_sample_person_graph():
    for u in random.sample(utils.get_all_users(), 50):
        print '='*80
        print
        print 'results for ', u
        make_full_person_graph(u)
        print
        print
        print
        
def test_sample_interest_graph():
    for i in random.sample(utils.get_all_interests(), 100):
        print '='*80
        print
        print 'results for ', i
        make_full_interest_graph(i)
        print
        print
        print
        

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    LOGGER.setLevel(logging.DEBUG)
    utils.init()
    #test_sample_interest_graph()
    test_sample_person_graph()
