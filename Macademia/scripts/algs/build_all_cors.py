import collections
import logging
import math
import pymongo
import random
import re
import sys


import users
import utils

logging.basicConfig(level=logging.INFO)

utils.init()

#interests = set(list(utils.get_all_interests())[:250])
interests = utils.get_all_interests()
sims = utils.get_correlation_matrix5(interests)
for i1, i1_sims in sims.items():
    for i2, sim in i1_sims.items():
        if sim >= 0.003:
            print '%s=%s %s=%s %s' % (i1.id, i1.text, i2.id, i2.text, sim)
