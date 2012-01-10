import string
import sys
import urllib


import utils

utils.init()

ids = set()
gold = open('dat/semantic_gold.txt', 'w')
for line in open('dat/WikiSimi3000_1.csv'):
    tokens = line.split('\t')
    page_id1 = utils.get_id(urllib.unquote(tokens[0].strip()))
    page_id2 = utils.get_id(urllib.unquote(tokens[1].strip()))
    score = int(tokens[2])
    if page_id1 < 0 or page_id2 < 0:
        sys.stderr.write('no id for line %s\n' % `line`)
    else:
        gold.write('%s\t%s\t%s\n' % (page_id1, page_id2, score))
        ids.add(page_id1)
        ids.add(page_id2)
gold.close()

gold_ids = open('dat/semantic_gold_ids.txt', 'w')
for id in ids:
    gold_ids.write('%s\n' % id)
gold_ids.close()
