import pymongo
import random
import re
import sys

import matplotlib
import matplotlib.pyplot as pyplot
import numpy

import utils

N_COLS = 5
N_ROWS = 2
#MAX_VALUES = 10000
MAX_VALUES = 200

host = 'localhost'
#dbName = 'wikipediaReadOnly'
dbName = 'macademia_prod'
cnx = pymongo.Connection(host)
db = cnx[dbName]

def main():
    utils.init()
    
    articleIds = getArticleIds()
    random.shuffle(articleIds)
    i = 0
    for id in articleIds:
        if i >= N_COLS * N_ROWS:
            break 
        scores = getScores(id)[:MAX_VALUES]
        if scores:
            plotOne(id, scores, i)
            i += 1
    pyplot.show()


def plotOne(id, values, i):
    X = range(1, len(values)+1)
    values.reverse()
    pyplot.subplot(N_ROWS, N_COLS, i)
    pyplot.plot(X, [0.03]*len(values), X, values)
    pyplot.axis([1, MAX_VALUES, .0001, 0.2])
    pyplot.xlabel(getArticleName(id))
    #pyplot.yscale('log')
    #pyplot.xscale('log')

def getArticleName(id):
    record = db.interests.find_one({'_id' : id}, {'text' : 1})
    if record:
        return record.get('text')
    #record = db.articlesToIds.find_one({'wpId' : id})
    #if record:
    #    return record.get('_id')

def getArticleIds():
    #records = db.articleSimilarities.find({}, {'_id' : 1})
    records = db.interests.find({}, {'_id' : 1})
    return [r['_id'] for r in records]

def getScores(id):
    #record = db.articleSimilarities.find_one({'_id' : id})
    record = db.interests.find_one({'_id' : id})
    scores = []
    #for pair in record['similarities'].split('|'):
    for pair in record['similar'].split('|'):
        if not pair:
            break
        (id, score) = pair.split(',')
        scores.append(float(score))
    scores.sort()
    return scores

main()
