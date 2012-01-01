#!/usr/bin/python -O

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
    ancestors = {}
    descendants = collections.defaultdict(dict)
    beg = time.time()
    i = 0
    for cat1 in cats_by_name.values():
        shortest = bfs(cat1)
        ancestors[cat1] = dict(shortest)
        for (cat2, d) in shortest.items():
            descendants[cat2][cat1] = d
        i += 1
        if i % 10000 == 0:
            LOGGER.info('explored %d of %d categories', i, len(cats_by_name))
    end = time.time()
    LOGGER.info('elapsed time is %.4f seconds', (end - beg))
    return ancestors, descendants

def compute_neighbors(cat, ancestors, descendants):
    neighbors = {}
    if cat in ancestors:
        for (c1, n1) in ancestors[cat].items():
            if c1 in descendants:
                for (c2, n2) in descendants[c1].items():
                    if c2 not in neighbors or (n1 + n2) < neighbors[c2]:
                        neighbors[c2] = n1 + n2
    return neighbors

def test_neighbors(ancestors, descendants):
    for cat1 in cats_by_name.values():
        neighbors = compute_neighbors(cat1, ancestors, descendants)
        items = [(n, cat2) for (cat2, n) in neighbors.items()]
        items.sort()
        for (n, cat2) in items[:1000]:
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
    test_neighbors(ancestors, descendants)
