import collections
import logging
import math
import pprint
import random
import sys

import utils

LOGGER = logging.getLogger(__name__)

SAMPLE_SIZE = 500
POW_SIM = 2.0
POW_DIVERSITY = 0.333
POW_POP = 1.0
DEBUG = False

NUM_TOP_INTERESTS_ROOT = 15
NUM_TOP_INTERESTS_ELEM = 30

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def make_interest_graph(root):
    LOGGER.debug('building graph for %s', root)

    candidates = root.get_similar()   # ignore the very closest items
    candidates = zip(range(len(candidates)), candidates)
    cluster_roots = set()
    while candidates and len(cluster_roots) < 5:
        LOGGER.debug('doing iteration %d', len(cluster_roots))
        candidates, cluster_roots = pick_subcluster_root(root, candidates, cluster_roots)

    cluster_map = { 'root' : root, 'map' : {} }
    for cr in [root] + list(cluster_roots):
        cluster_map['map'][cr] = None
        cluster = pick_cluster_elems(cr, list(cluster_roots) + [root])
        cluster_map['map'][cr] = cluster

    return cluster_map

def pick_subcluster_root(root, candidates, current_roots):
    current_top = set(root.get_similar()[:NUM_TOP_INTERESTS_ROOT])
    for i in current_roots:
        current_top.add(i)
        current_top.update(i.get_similar()[:NUM_TOP_INTERESTS_ELEM])

    debug = []

    top_match = None
    top_score = -1.0
    for (rank, i) in candidates:
        if i in current_roots or i == root:
            continue
        candidate_top = set(i.get_similar()[:NUM_TOP_INTERESTS_ROOT])
        n_new = len(candidate_top.difference(current_top))
        sim = root.get_similarity(i)
        s = (
                (sim ** POW_SIM) *
                (n_new ** POW_DIVERSITY) *
                (math.log(i.count + 1) ** POW_POP) 
        )
        if LOGGER.isEnabledFor(logging.DEBUG):
            debug.append([s, root.get_similarity(i), n_new, math.log(i.count + 1), i])
        if s >= top_score:
            top_score = s
            top_match = (rank, i)

    if LOGGER.isEnabledFor(logging.DEBUG):
        debug.sort()
        debug.reverse()
        for i in range(len(debug)):
            LOGGER.debug('\t%s', debug[i])

    candidates.remove(top_match)
    current_roots.add(top_match[1])

    return candidates, current_roots

def pick_cluster_elems(root, other_roots):
    candidates = root.get_similar()
    candidates = zip(range(len(candidates)), candidates)

    # prune out candidates closer to some other root
    for (rank, i) in list(candidates):
        for other in other_roots:
            if i == other or i.get_similarity(root) < i.get_similarity(other):
                candidates.remove((rank, i))
                break

    cluster_elems = set()
    while candidates and len(cluster_elems) < 7:
        LOGGER.debug('\tdoing iteration %d', len(cluster_elems))
        candidates, cluster_elems = pick_subcluster_root(root, candidates, cluster_elems)

    return cluster_elems


def describe_gold_standard(gold):
    triples = []
    for i1 in gold:
        for (i2, n) in gold[i1].items():
            triples.append((n, i1, i2))
    triples.sort()
    triples.reverse()
    for (n, i1, i2) in triples:
        print i1, i2, n

def grid_evaluation(sample, gold):
    global POW_SIM, POW_DIVERSITY, POW_POP

    POW_POP = 1.0   # fix it
    options = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0]
    for POW_SIM in [1.0, 1.333, 1.666, 2.00, 2.333, 2.666, 3.0]:
        for POW_DIVERSITY in [0, 0.1, 0.25, 0.33, 0.5, 0.75]:
                evaluate(sample, gold)


def evaluate(sample, gold):
    sys.stdout.write('sim=%.2f, diversity=%.2f, pop=%.2f '
            % (POW_SIM, POW_DIVERSITY, POW_POP))

    hits = 0
    weights = 0
    total = 0
    for i in sample:
        g = make_interest_graph(i)
        for j in g['map']:
            total += 1
            if gold[i][j]:
                hits += 1
                weights += math.log(1.0 + hits)

    sys.stdout.write('hits: %.3f%% weight=%.3f (%d of %d)\n'
                    % (100.0 * hits / total, weights / total, hits, total))
        

def print_interest_subclusters():
    for i in utils.getAllInterests():
        print i
        g = make_interest_graph(i)
        for j in g['map']:
            print '\t\t%s:' % j
            for k in g['map'][j]:
                print '\t\t\t%s' % k
        print

def tune_parameters():
    gold = utils.read_gold_standard('./gold/session_navs.txt')
    sample = random.sample(gold.keys(), SAMPLE_SIZE)
    
    #import cProfile
    #cProfile.runctx('grid_evaluation(sample, gold)', globals(), locals())
    grid_evaluation(sample, gold)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    utils.init()
    print_interest_subclusters()
    #tune_parameters()
