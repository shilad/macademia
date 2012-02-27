import collections
import logging
import math
import pymongo
import random
import re
import sys

import users
import utils

article_indexes = {}

def main():
    utils.init()
    #interests = set(list(utils.get_all_interests())[:50])
    interests = utils.get_all_interests()
    matrix = build_article_adjacencies(interests)
    write_matrix(matrix)
    write_ids_to_indexes()

def id_to_index(id):
    id = int(id)
    if id in article_indexes:
        return article_indexes[id]
    else:
        article_indexes[id] = len(article_indexes)
        return article_indexes[id]

def build_article_adjacencies(interests):
    article_sims = collections.defaultdict(list)
    for i in interests:
        article_id = utils.get_article_id_for_interest(i)
        if not article_id:
            continue
        index1 = id_to_index(article_id)
        ranks = utils.get_article_similarity_ranks(article_id, 2000).items()
        ranks.sort(key=lambda pair: pair[1])
        for (article_id2, rank) in ranks:
            article_sims[index1].append(article_id2)

    return article_sims

def transpose_matrix(matrix):
    transpose = collections.defaultdict(list)
    ids = sorted(list(matrix.keys()))
    for id1 in ids:
        row = matrix[id1]
        for (rank, id2) in zip(xrange(len(row)), row):
            transpose[id2].append((id1, rank))
    return transpose

def write_ids_to_indexes():
    f = open('svds/article_indexes.txt', 'w')
    for (id, index) in article_indexes.items():
        f.write('%s\t%s\n' % (id, index))
    f.close()

def write_matrix(matrix):
    transpose = transpose_matrix(matrix)

    nrows = len(matrix)
    ncols = len(transpose)
    nentries = sum([len(row) for row in matrix.values()])

    f = open('svds/article_matrix.txt', 'w')
    f.write('%d %d %d\n' % (nrows, ncols, nentries))
    for index1, row in transpose.items():
        f.write('%d\n' % len(row))
        for (index2, rank) in row:
            score = 1.0 / (math.log(rank + 10) / math.log(2))
            f.write('%d %.4f\n' % (index2, score))
    f.write('\n')
    

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    main()
