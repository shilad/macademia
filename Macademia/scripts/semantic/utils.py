import collections
import logging
import math
import pymongo
import re
import sys

HOST = 'localhost'
DB_NAME = 'macademia_prod'
WP_DB_NAME = 'wikipediaReadOnly'
db = None
wp_db = None

LOGGER = logging.getLogger(__name__)

def init(config={}):
    global HOST, DB_NAME, WP_DB_NAME
    global db, wp_db
    global interests_by_name, interests_by_id

    HOST = config.get('host', HOST)
    DB_NAME = config.get('db_name', DB_NAME)
    WP_DB_NAME = config.get('wp_db_name', WP_DB_NAME)
    cnx = pymongo.Connection(HOST)
    db = cnx[DB_NAME]
    wp_db = cnx[WP_DB_NAME]

def get_title(wp_id):
    global db, wp_db

    record = wp_db.articlesToIds.find_one({'wpId' : wp_id})
    if record:
        return record.get('_id', 'unknown')
    else:
        return 'unknown'

def get_id(title):
    title = title.replace('_', ' ')
    record = wp_db.articlesToIds.find_one({'_id' : title})
    if record:
        return record.get('wpId', -1)
    else:
        return -1


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def test():
    init()

NORMALIZE_PATTERN = re.compile('[\W_]+')

def normalize(text):
    return NORMALIZE_PATTERN.sub('', text).lower()

def mean(l):
    return 1.0 * sum(l) / len(l)

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    test()
