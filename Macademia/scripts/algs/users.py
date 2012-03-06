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
    LOGGER.debug('user %s interests are %s', root_user.id, ', '.join([i.text for i in root_user.interests if len(i.sim_list) > 1]))
    interests = set([i for i in root_user.interests])
    clusters = cluster_user_interests(interests)

    print 'person clusters are:'
    for rep, c in clusters.items():
        print '\t%s:%s' % (rep.text, [i.text for i in c])

    weights = dict([(r,1.0) for r in clusters])
    (users, relations) = find_user_results(clusters.keys(), weights, root_user, clusters)
    for u in users:
        print_user_relations(u, relations[u], 'chose user with interests', '\t')


def print_user_relations(u, relations, caption, prefix):
    print caption, ', '.join([i.text for i in u.interests])
    for (root, rels) in relations.items():
        print '%s%s: %s' % (prefix, root.text, ', '.join([i.text for i in rels]))


def find_user_results(roots, weights, root_user=None, clusters=None):
    LOGGER.debug('roots are %s', ', '.join([i.text for i in roots]))
    candidate_interests = set()
    rev_cluster_map = {}
    for root, c in clusters.items():
        for interest in c:
            candidate_interests.update(interest.get_similar()[:500])
            rev_cluster_map[interest] = root
    LOGGER.debug('num candidates is %s', len(candidate_interests))

    # generate possible relations
    closest_root = {}
    for i in candidate_interests:
        sims = [(i.get_similarity2(j), j) for j in roots]
        max_sim = max([s for (s, j) in sims])
        if max_sim >= 0.01:
            assert(max_sim > 0)
            best_roots = [j for (s, j) in sims if s == max_sim]
            closest_root[i] = random.choice(best_roots)

    # similarities for candidate interests to any one of the element in the cluster
    interest_rels = {}
    for (i, root) in closest_root.items():
        interest_rels[i] = max([i.get_similarity2(j) for j in clusters[root]])

    # build up relations
    user_relations = {}
    for (related, root) in closest_root.items():
        for user in utils.get_users_with_interest(related):
            if not user in user_relations:
                user_relations[user] = collections.defaultdict(list)
            user_relations[user][root].append(related)

    # sort interests within relations by similarity
    for (user, relations) in user_relations.items():
        for (root, related) in relations.items():
            related.sort(key=lambda i: interest_rels[i])
            related.reverse()

    # score users
    user_relevances = {}
    user_profiles = {}
    for (user, relations) in user_relations.items():
        rel = 0.0
        profile = []
        for root in roots:
            if root in relations:
                sims = [interest_rels[i] for i in relations[root]]
                score = sum([
                        s * (0.5**penalty)
                        for (penalty, s) in enumerate(sims)
                    ])
                profile.append(len(relations))
                rel += score
            else:
                profile.append(0)
        norm = sum([x*x for x in profile]) ** 0.5
        profile = [x / norm for x in profile]
        user_relevances[user] = rel
        user_profiles[user] = profile

    # choose users
    candidates = set(user_relevances.keys())
    if root_user and root_user in candidates:
        candidates.remove(root_user)

    chosen = set()
    while candidates and len(chosen) < 20:
        #print 'iteration %d, chosen are:' % len(chosen)
        #for u in chosen:
            #print_user_relations(u, user_relations[u], '\tinterests', '\t\t')
        best_user = None
        best_score = None
        #print 'candidates are:'
        for u1 in candidates:
            sims = []
            for u2 in chosen:
                dot = sum([x*y for (x,y) in zip(user_profiles[u1], user_profiles[u2])])
                sims.append(dot)
            sims.sort()
            redundancy = sum(sims[-2:])  # three largest similarities
            score = user_relevances[u1] - redundancy
            #caption = '\tcandidate score=%.6f, sim=%.6f redund=%.6f' % (score, user_relevances[u1], redundancy)
            #print_user_relations(u1, user_relations[u1], caption, '\t\t')
            if score > best_score:
                best_score = score
                best_user = u1
        #caption = 'best has score=%.6f' % best_score
        #print_user_relations(best_user, user_relations[best_user], caption, '\t')
        candidates.remove(best_user)
        chosen.add(best_user)

    return chosen, dict([(u, user_relations[u]) for u in chosen])
        

def cluster_user_interests(interests):
    correlations = utils.get_correlation_matrix(interests)

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
                #LOGGER.debug('%s, %s, sim=%.3f', c1, c2, sim)
                if sim > closestSim:
                    closestSim = sim
                    closestPair = (c1, c2)

        if closestSim < 0.01:
            break

        if len(clusters) <= 4 and closestSim <= 0.1:
            break

        (c1, c2) = closestPair
        if len(clusters) > 4 and len(c1) > 1 and len(c2) > 1 and closestSim < 0.05:
            break
    
        LOGGER.debug('merging [%s] and [%s] with sim %.3f', describe(c1), describe(c2), closestSim)
        clusters.remove(c2)
        c1.update(c2)

    # pick the best representative for each cluster
    reps = []
    for c in clusters:
        best_score = 0.0
        best = None
        for i in c:
            score = 0.00001
            for j in c:
                if i != j:
                    score += correlations[i].get(j, 0.0)
            score *= math.log(i.count+1)
            if score > best_score:
                best_score = score
                best = i
        assert(best)
        reps.append(best)

    return dict(zip(reps, clusters))
    

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
    #for u in [utils.get_user_by_id(3568), utils.get_user_by_id(16)]:
    #for u in [utils.get_user_by_id(16)]:
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
    #LOGGER.setLevel(logging.DEBUG)
    utils.init()
    #test_sample_interest_graph()
    test_sample_person_graph()
