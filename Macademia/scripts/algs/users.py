import collections
import itertools
import logging
import math
import random

import clusters
import utils

POW_SIM = 2.0
POW_DIVERSITY = 0.5
POW_POP = 1.0

NUM_TOP_INTERESTS_ROOT = 15
NUM_TOP_INTERESTS_ELEM = 30

MAX_CLUSTERS = 4
NUM_USERS = 20
MIN_USERS_PER_CLUSTER = 2

LOGGER = logging.getLogger(__name__)
DEBUG = False

def make_full_person_graph(root_user):
    LOGGER.debug('user interests are %s', (' '.join([i.text for i in root_user.interests if len(i.sim_list) > 1])))
    interests = set([i for i in root_user.interests])
    clusters = cluster_user_interests(interests)

    print 'person clusters are:'
    for c in clusters:
        print '\t%s' % [i.text for i in c]



def cluster_user_interests(interests):
    correlations = utils.get_correlation_matrix4(interests)

    def describe(cluster): return '[' + ' '.join([i.text for i in cluster]) + ']'
    clusters = [set([i]) for i in interests]
    closestSim = 1.0
    while True:
        closestPair = None
        closestSim = 0.0
    
        for c1 in clusters:
            for c2 in clusters:
                if c1 == c2:
                    continue
                sim = 0.0
                for i in c1:
                    for j in c2:
                        sim += correlations[i].get(j, 0.0)
                size_penalty = math.log(len(c1) * len(c2) + 1) / (2 * math.log(2))
                sim /= (len(c1)*len(c2)*size_penalty)
                LOGGER.debug('%s, %s, sim=%.3f', c1, c2, sim)
                if sim > closestSim:
                    closestSim = sim
                    closestPair = (c1, c2)

        if closestSim < 0.01:
            break

        if len(clusters) <= 4 and closestSim <= 0.1:
            break
    
        if closestPair:
            c1, c2 = closestPair
            LOGGER.debug('merging [%s] and [%s] with sim %.3f', describe(c1), describe(c2), closestSim)
            clusters.remove(c2)
            c1.update(c2)

    return clusters
    

def OLDER_STUFF():
    while len(roots) < 4 and candidates:
        (candidates, roots) = pick_subcluster_root(candidates, roots, interests)
    
    roots = list(roots)     # order matters
    clusters = []           #
    for r in roots:
        clusters.append(set([r]))
    outliers = []

    # reset the interests
    for i in interests.difference(set(roots)):
        # try from i's perspective
        pairs = [ (i.get_similarity(r), c)
                  for (r,c) in zip(roots,clusters)
                  if i.get_similarity(r) ]
        if pairs:
            pairs.sort()
            (s, c) = pairs[-1]
            c.add(i)
            continue

        # try from the cluster's perspective
        pairs = [ (r.get_similarity(i), c)
                  for (r,c) in zip(roots,clusters)
                  if r.get_similarity(i) ]
        if pairs:
            pairs.sort()
            (s, c) = pairs[-1]
            c.add(i)
        else:
            outliers.append(i)
        


    #clusters = find_clusters(interests)
    #outliers = find_outliers(interests)

    #clusters = []
    #for i in interests.difference(outliers):
        #add_interest_to_clustering(clusters, i)
    #LOGGER.debug('initial clustering is %s', clusters)
     
    #while len(clusters) > MAX_CLUSTERS:
        #merge_one_pair(clusters)
    #LOGGER.debug('final clustering is %s', clusters)

def pick_subcluster_root(candidates, current_roots, interests):
    current_top = set()
    covered = set()
    for i in current_roots:
        current_top.add(i)
        current_top.update(i.get_similar()[:100])
        covered.update(i.get_similar())

    debug = []

    top_match = None
    top_score = -1.0

    uncovered = interests.intersection(covered)

    for i in candidates:
        if i in current_roots:
            continue
        candidate_top = set(i.get_similar()[:100])
        n_new = len(candidate_top.difference(current_top))
        n_covered = len(uncovered.intersection(i.get_similar()))

        #print 'i is', i, 'current are', current_roots, 'n_new is', n_new, 'of', len(candidate_top)
        if n_new < (len(candidate_top)+5) / 2:
            continue

        # TODO: add in component for user coverage
        s = (
                (math.log(n_covered + 1)) *
                (n_new ** POW_DIVERSITY) *
                (math.log(i.count + 1) ** POW_POP)
        )
        if LOGGER.isEnabledFor(logging.DEBUG):
            debug.append([s, n_new, math.log(i.count + 1), i])
        if s >= top_score:
            top_score = s
            top_match = i

    if not top_match:
        return set(), current_roots

    if LOGGER.isEnabledFor(logging.DEBUG):
        debug.sort()
        debug.reverse()
        for i in range(len(debug)):
            LOGGER.debug('\t%s', debug[i])

    candidates.remove(top_match)
    current_roots.add(top_match)

    return candidates, current_roots


SAME_CLUSTER_THRESHOLD = 7.6

def find_clusters(interests):
    d1 = 6.0
    d2 = 7.0 * 7.0

    covered = collections.defaultdict(set)
    for i in interests:
        covered[i].add(i)
        for j in interests:
            s = max(i.get_similarity(j), j.get_similarity(i))
            if s >= d1:
                covered[i].add(j)

    covered2 = []
    for i in interests:
        neighbors = set(covered[i])
        for j in covered[i]:
            if i == j: continue
            s1 = max(i.get_similarity(j), j.get_similarity(i))
            for k in covered[j].difference(neighbors):
                s2 = s1 * max(j.get_similarity(k), k.get_similarity(j))
                if s2 >= d2:
                    neighbors.add(k)
        covered2.append(neighbors)

    covered_set = set()

    clusters = []
    for i in xrange(4):
        if not covered2: break
        covered2.sort(key=lambda x: len(x))
        covered2.reverse()
        covered_set.update(covered2[0])
        clusters.append(covered2[0])
        LOGGER.debug('removing covered set %s' % covered2[0])
        del(covered2[0])
        for c in covered2:
            c.difference_update(covered_set)
        covered2 = [c for c in covered2 if c]

    # tighten up the clusters
    for n in xrange(3):
        for i in list(itertools.chain(*clusters)):
            best_score = 0
            best_cluster = None
            orig_cluster = None
            for c in clusters:
                if i in c:
                    orig_cluster = c
                if len(c) == 0 or (len(c) == 1 and i in c):  # nothing here!
                    continue
                max_sim = 0
                score = 0.0
                for j in c.difference([i]):
                    sim = max(i.get_similarity(j), j.get_similarity(i))
                    max_sim = max(max_sim, sim)
                    score += sim ** 4
                score = score ** 0.25 / len(c.difference([i]))
                if max_sim >= 6.0 and score > best_score:
                    best_score = 0
                    best_cluster = c
            if best_cluster != None and best_cluster != orig_cluster:
                assert(orig_cluster)
                orig_cluster.remove(i)
                best_cluster.add(i)

    return clusters


def add_interest_to_clustering(clusters, i):
    span = []
    for c in clusters:
        for j in c:
            sim = max(i.get_similarity(j), j.get_similarity(i))
            if sim > SAME_CLUSTER_THRESHOLD:
                span.append(c)
                break

    if span:
        # fold all clusters into span[0]
        for c in span[1:]:
            span[0].update(c)
            clusters.remove(c)
    else:
        clusters.append(set([i]))    # new!

def find_outliers(interests):
    optimal_distance = 10.0 / 8.0 * 2
    def d(score): return 10.0 / score

    covered = collections.defaultdict(list)
    for i in interests:
        covered[i] = set([  j for (j, score) in i.sim_scores.items()
                        if d(score) <= optimal_distance and j in interests ])

    covered2 = collections.defaultdict(list)
    for i in interests:
        covered2[i] = set(covered[i])
        covered2[i].add(i)                 # hack: i covers itself
        for j in list(covered2[i]):
            if j != i:
                for k in covered.get(j, []):
                    if d(i.get_similarity(j)) + d(j.get_similarity(k)) <= optimal_distance:
                        covered2[i].add(k)

    covered_set = set() 
    covered2 = covered2.values()

    for i in xrange(4):
        if not covered2: break
        covered2.sort(key=lambda x: len(x))
        covered2.reverse()
        covered_set.update(covered2[0])
        LOGGER.debug('removing covered set %s' % covered2[0])
        del(covered2[0])
        for c in covered2:
            c.difference_update(covered_set)
        covered2 = [c for c in covered2 if c]

    uncovered = interests.difference(covered_set)

    LOGGER.debug('uncovered is %s' % uncovered)
    return uncovered

def merge_one_pair(clusters):
    best_sim = 0.0
    best_pair = None
    for c1 in clusters:
        for c2 in clusters:
            if c1 == c2:
                continue
            sim = cluster_sim_max(c1, c2)
            if sim > best_sim:
                best_sim = sim
                best_pair = (c1, c2)
    if not best_pair:
        return False
    (c1, c2) = best_pair
    LOGGER.debug('merging %s and %s with score %.2f', [i.text for i in c1], [i.text for i in c2], best_sim)
    clusters.remove(c2)
    c1.update(c2)
    return True

def cluster_sim_max(c1, c2):
    sim = 0.0
    for i1 in c1:
        for i2 in c2:
            sim = max(sim, i1.get_similarity(i2))
            sim = max(sim, i2.get_similarity(i1))
    return sim
 
def cluster_sim(c1, c2):
    sim = 0.0
    for i1 in c1:
        for i2 in c2:
            sim += i1.get_similarity(i2) ** 4
            sim += i2.get_similarity(i1) ** 4
    return sim ** (1/4.0) / (len(c1) * len(c2))
            

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
    #for u in [utils.get_user_by_id(3568)]:
    for u in random.sample(utils.get_all_users(), 200):
        print '='*80
        print
        print 'results for ', u, ' '.join([i.text for i in u.interests])
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
