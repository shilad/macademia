import collections
import logging
import math
import pymongo
import random
import re
import sys

import numpy
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

def make_lda():
    dictionary = gensim.corpora.Dictionary.load_from_text('svd/dictionary.txt')
    corpus = gensim.corpora.MmCorpus('svd/corpus.mm')
    tfidf = gensim.models.TfidfModel(corpus)
    model = gensim.models.ldamodel.LdaModel(tfidf[corpus], id2word=dictionary, num_topics=1000, passes=20, update_every=0, distributed=True,chunksize=1000)
    model.save('svd/lda.txt')

def describe_lda():
    utils.init()
    model = gensim.models.ldamodel.LdaModel.load('svd/lda.txt')
    def article_name(article_id):
        name = utils.get_article_name(article_id)
        return name.encode('ascii', 'ignore') if name else 'unknown'

#    print 'information about topics:'
#    for i in random.sample(range(model.num_topics), 50):
#        print 'topic %d:' % i
#        topic = model.state.get_lambda()[i]
#        topic = topic / topic.sum() # normalize to probability dist
#        for id in numpy.argsort(topic)[::-1][:10]:
#            score = topic[id]
#            article_id = model.id2word[id]
#            print '\t%.6f: %s' % (score, article_name(article_id))

    dictionary = model.id2word
    interests = list(utils.get_all_interests())
    for i in random.sample(interests, 50):
        article_id1 = utils.get_article_id_for_interest(i)
        if not article_id1:
            continue
        doc = make_doc(i, dictionary)

        doc_lda = model[doc]
        doc_lda.sort(key=lambda pair: pair[1])
        doc_lda.reverse()
        sys.stdout.write('topics for %s (article %s):\n' % (i.text, article_name(article_id1)))
        for (topic_id, topic_score) in doc_lda:
            sys.stdout.write('\t%.6f topic %d:' % (topic_score, topic_id))
            topic = model.state.get_lambda()[topic_id]
            topic = topic / topic.sum() # normalize to probability dist
            for id in numpy.argsort(topic)[::-1][:10]:
                score = topic[id]
                article_id = model.id2word[id]
                sys.stdout.write(', ' + article_name(article_id))
            sys.stdout.write('\n')


def make_doc(interest, dictionary):
    article_id1 = utils.get_article_id_for_interest(interest)
    if not article_id1:
        return None
    doc = []
    ranks = utils.get_article_similarity_ranks(article_id1, 2000).items()
    for (article_id2, rank) in ranks:
        if article_id2 in dictionary.token2id:
            id = dictionary.token2id[article_id2]
            score = 1.0 / (math.log(rank + 5) / math.log(2))
            doc.append((id, score))
    return doc


def make_index():
    logging.info('loading dictionary')
    dictionary = gensim.corpora.Dictionary.load_from_text('svd/dictionary.txt')
    logging.info('loading corpus')
    corpus = gensim.corpora.MmCorpus('svd/corpus.mm')
    tfidf = gensim.models.TfidfModel(corpus)
    logging.info('loading model')
    model = gensim.models.ldamodel.LdaModel.load('svd/lda.txt')
    logging.info('building lda docs')
    lda_corpus = model[tfidf[corpus]]
    logging.info('building index')
    index = gensim.similarities.docsim.Similarity('/tmp/lda_index.txt', lda_corpus, 1000)
    index.save('svd/lda_index.txt')


def get_similar():
    utils.init()
    logging.info('loading interests from svd/interests.txt')
    interests = [
            utils.get_interest_by_id(int(line))
            for line in open('svd/interests.txt')
        ]
    index = gensim.similarities.docsim.Similarity.load('svd/lda_index.txt')
    for (i1, similarities) in enumerate(index):
        ordered = []
        for (i2, sim) in enumerate(similarities):
            ordered.append((sim, i2))
        ordered.sort()
        ordered.reverse()
        for (sim, i2) in ordered[:500]:
            print '%s=%s %s=%s %.7f' % (interests[i1].id, interests[i1].text, interests[i2].id, interests[i2].text, sim)


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
    #make_lda()
    #describe_lda()
    #make_index()
    get_similar()
