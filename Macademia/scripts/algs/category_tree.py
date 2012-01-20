#!/usr/bin/python -O

import blist

import multiprocessing
import collections
import logging
import math
import random
import string
import sys
import time

import utils

LOGGER = logging.getLogger(__name__)

cats_by_name = {}

class Category:
    __slots = ['id', 'name', 'edges']
    def __init__(self, id, name, edges): 
        self.id = id
        self.name = name
        self.edges = edges
    
    def replace_edges(self):
        num_missing = 0
        new_edges = []
        for n in self.edges:
            if n.lower() in cats_by_name:
                new_edges.append(cats_by_name[n.lower()])
            else:
                num_missing += 1
        self.edges = new_edges
        return num_missing

def get_category_by_name(name):
    return cats_by_name.get(name.lower())

def all_bfs():
    ancestors = collections.defaultdict(list)   # cat => [(cat1, n1), (cat2, n2), ... ]
    descendants = collections.defaultdict(list) # same structure
    beg = time.time()
    i = 0
    for cat1 in cats_by_name.values():
        shortest = bfs(cat1)
        for (cat2, distance) in shortest.items():
            ancestors[cat1].append((cat2, distance))
            descendants[cat2].append((cat1, distance))
        i += 1
        if i % 10000 == 0:
            LOGGER.info('explored %d of %d categories', i, len(cats_by_name))
    end = time.time()
    LOGGER.info('elapsed time is %.4f seconds', (end - beg))
    LOGGER.info('sorting relations...')
    f = lambda i1, i2: cmp(i1[1], i2[1])
    for relations in (ancestors, descendants):
        for cat in relations:
            relations[cat].sort(f)
    LOGGER.info('finished sorting relations')
    return ancestors, descendants

def compute_neighbors(cat, ancestors, descendants):
    LOGGER.info('computing neighbors for %s', cat.name)
    beg = time.time()
    neighbors = {}
    sorted_scores = blist.sortedset()
    furthest = 1000000000000000000
    if cat in ancestors:
        for (c1, n1) in ancestors[cat]:
            if n1 > furthest:
                break
            if c1 in descendants:
                for (c2, n2) in descendants[c1]:
                    distance = n1 + n2
                    if distance > furthest:
                        break
                    if c2 in neighbors:
                        if distance > neighbors[c2]:
                            continue
                        old_distance = neighbors[c2]
                        sorted_scores.remove((old_distance, c2))
                        del(neighbors[c2])
                    if len(neighbors) < 1000:
                        neighbors[c2] = distance
                        sorted_scores.add((distance, c2))
                    else:
                        furthest_cat = sorted_scores[-1][1]
                        del(neighbors[furthest_cat])
                        del(sorted_scores[-1])
                        neighbors[c2] = distance
                        sorted_scores.add((distance, c2))
                    assert(len(neighbors) == len(sorted_scores))
                    if len(neighbors) >= 1000:
                        furthest = sorted_scores[-1][0]
                
    end = time.time()
    LOGGER.info('computed %d neighbors for %s in %.3f seconds', len(neighbors), cat.name, (end-beg))
    return sorted_scores

def worker_callback(cat_name):
    global worker_ancestors
    global worker_descendants
    global cats_by_name

    cat = cats_by_name[cat_name]
    results = []
    for (score, cat2) in compute_neighbors(cat, worker_ancestors, worker_descendants):
        results.append((cat2.name, score))
    return (cat.name, results)

def worker_output_results(params):
    (cat1, sorted_scores) = params
    for (cat2, score) in sorted_scores:
        if cat1 != cat2:
            print '%.4f\t%s\t%s' % (-math.log(1.0*(score+1)/10), cat1, cat2)
            
def compute_all_neighbors(ancestors, descendants, n_processes=3):
    global worker_ancestors
    global worker_descendants

    worker_ancestors = ancestors
    worker_descendants = descendants
    pool = multiprocessing.Pool(n_processes)
    result = pool.map_async(worker_callback, cats_by_name.keys(), callback=worker_output_results)
    result.wait()

def test_neighbors(ancestors, descendants):
    for cat1 in cats_by_name.values():
        for (n, cat2) in compute_neighbors(cat1, ancestors, descendants):
            if cat1 != cat2:
                print '%.4f\t%s\t%s' % (-math.log(1.0*(n+1)/10), cat1.name, cat2.name)
        
def bfs(root):
    shortest = collections.defaultdict(lambda: 1000000000)
    shortest[root] = 0
    step(root, 1, shortest, 4)
    return shortest

def test_bfs():
    sample = random.sample(cats_by_name.values(), 10)

    for root in sample:
        shortest = bfs(root)
        print 'shortest for %s (%d nodes within distance 4)' % (root.name, len(shortest))
        by_distance = collections.defaultdict(list)
        for (cat, d) in shortest.items():
            by_distance[d].append(cat)
        for i in xrange(1, 5):
            print '\tdistance %d: %s' % (i, [c.name for c in by_distance[i]])

def step(node, step_num, shortest, remaining_steps):
    if remaining_steps == 0:
        return
    for n2 in node.edges:
        if step_num < shortest[n2]:
            shortest[n2] = step_num
            step(n2, step_num + 1, shortest, remaining_steps - 1)

def read_categories():
    global cats_by_name

    LOGGER.info('reading categories...')
    for line in open('dat/categories.txt'):
        tokens = line.strip().split('\t')
        if len(tokens) >= 2:
            id = int(tokens[0])
            name = tokens[1]
            edges = [e.strip() for e in tokens[2:]]
            cats_by_name[name.lower()] = Category(id, name, edges)
        else:
            LOGGER.warn('invalid line in categories.txt: %s', `line`)
    LOGGER.info('replacing edges...')
    num_edges = 0
    num_unmatched = 0
    for c in cats_by_name.values():
        num_unmatched += c.replace_edges()
        num_edges += len(c.edges)
    LOGGER.info('finished reading %d categories with %d edges (%d unmatched edges).',
                 len(cats_by_name), num_edges, num_unmatched)
        
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    read_categories()
    (ancestors, descendants) = all_bfs()
    compute_all_neighbors(ancestors, descendants)
