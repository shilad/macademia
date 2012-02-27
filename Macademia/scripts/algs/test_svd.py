import collections
import logging
import math
import pymongo
import random
import re
import sys

import gensim

import users
import utils

logging.basicConfig(level=logging.DEBUG)

def make_corpus():
    utils.init()
    interests = list(utils.get_all_interests())
    corpus = MyCorpus(interests)
    corpus.build_interests_to_articles()
    corpus.build_dict()
    corpus.write_corpus()

def transform_corpus():
    dictionary = gensim.corpora.Dictionary.load_from_text('svd/dictionary.txt')
    corpus = gensim.corpora.MmCorpus('svd/corpus.mm')
    tfidf = gensim.models.TfidfModel(corpus)
    model = gensim.models.ldamodel.LdaModel(tfidf[corpus], id2word=dictionary, num_topics=1000, passes=20, update_every=0, distributed=True)
    model.save('svd/lda.txt')

class MyCorpus:
    def __init__(self, interests):
        self.interests = list(interests)
        self.mapped_interests = []  # interest, article id pairs
        self.dictionary = gensim.corpora.Dictionary()

    def build_interests_to_articles(self):
        for i in self.interests:
            article_id = utils.get_article_id_for_interest(i)
            if article_id:
                self.mapped_interests.append((i, article_id))

    def build_dict(self):
        # force interest articles into resultset
        #article_doc = self.mapped_interests.values()
        #for i in range(5):
            #self.dictionary.doc2bow(article_doc, True)

        for (i, article_id) in self.mapped_interests:
            doc = list(utils.get_article_similarity_ranks(article_id, 2000).keys())
            self.dictionary.doc2bow(doc, True)

        self.dictionary.filter_extremes()
        self.dictionary.save_as_text('svd/dictionary.txt')

    def __iter__(self):
        for (i, article_id1) in self.mapped_interests:
            doc = []
            ranks = utils.get_article_similarity_ranks(article_id1, 2000).items()
            for (article_id2, rank) in ranks:
                if article_id2 in self.dictionary.token2id:
                    id = self.dictionary.token2id[article_id2]
                    score = 1.0 / (math.log(rank + 5) / math.log(2))
                    doc.append((id, score))
            yield doc

    def write_corpus(self):
        gensim.corpora.MmCorpus.serialize('svd/corpus.mm', self, progress_cnt=100)
        f = open('svd/interests.txt', 'w')
        for (i, article_id) in self.mapped_interests:
            f.write('%s\n' % i.id)
        f.close()
        

if __name__ == '__main__':
    #make_corpus()
    transform_corpus()
