import collections
import logging
import math
import pymongo
import random
import re
import sys


import numpy as np  
import scipy as sp  



import users
import utils

logging.basicConfig(level=logging.DEBUG)


if len(sys.argv) < 3:
    sys.stderr.write('usage: %s interest1 interest2 interest3...\n')
    sys.exit(1)


interest_strs = sys.argv[1:]
numInterests = 100

utils.init()

interests = []
sims = collections.defaultdict(dict)
for i in interest_strs:
    i = utils.get_interest_by_normalized_text(i)
    if not i:
        sys.stdout.write('interest %s: NO INFORMATION\n' % i)
    else:
        article = utils.get_article_name_for_interest(i)
        sys.stdout.write('interests %s: id=%d, n=%d, article=%s\n' % (i.text, i.id, i.count, `article`))
        interests.append(i)

correlations = utils.get_correlation_matrix(interests)

sys.stdout.write('\n')
sys.stdout.write('% 12s  ' % '')
for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
sys.stdout.write('\n')

for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
    for j in interests:
        sim = '%.3f' % correlations[i].get(j, 0.0)
        sys.stdout.write('% 12s  ' % sim)
    sys.stdout.write('\n')


correlations = utils.get_correlation_matrix2(interests)

sys.stdout.write('\n')
sys.stdout.write('% 12s  ' % '')
for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
sys.stdout.write('\n')

for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
    for j in interests:
        sim = '%.3f' % correlations[i].get(j, 0.0)
        sys.stdout.write('% 12s  ' % sim)
    sys.stdout.write('\n')

correlations = utils.get_correlation_matrix3(interests)

sys.stdout.write('\n')
sys.stdout.write('% 12s  ' % '')
for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
sys.stdout.write('\n')

for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
    for j in interests:
        sim = '%.3f' % correlations[i].get(j, 0.0)
        sys.stdout.write('% 12s  ' % sim)
    sys.stdout.write('\n')

correlations = utils.get_correlation_matrix4(interests)

sys.stdout.write('\n')
sys.stdout.write('% 12s  ' % '')
for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
sys.stdout.write('\n')

for i in interests:
    sys.stdout.write('% 12s  ' % i.text[:12])
    for j in interests:
        sim = '%.3f' % correlations[i].get(j, 0.0)
        sys.stdout.write('% 12s  ' % sim)
    sys.stdout.write('\n')

clusters = users.cluster_user_interests(set(interests))

print 'clusters are:'
for c in clusters:
    print ' '.join([i.text for i in c])
