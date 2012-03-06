import collections
import gzip
import logging
import math
import string
import sys
import utils

FRACTION_PAGES_TO_SUMMARIZE = 0.01
RESULTS_SUMMARY_THRESHOLD = 2

LOGGER = logging.getLogger(__name__)

def should_process(id_str):
    return hash(id_str) % int(1/FRACTION_PAGES_TO_SUMMARIZE) == 0

class ResultFile:
    def __init__(self, name, path):
        self.name = name
        self.path = path
        self.file = gzip.GzipFile(path, 'r')
        self.id = ''
        self.scores = {}
        self.is_finished = False

    def __repr__(self):
        return '<result_file %s, id %s>' % (`self.path`, `self.id`)

    def __str__(self):
        return self.__repr__()

    def __cmp__(self, other):
        return cmp(self.id, other.id)

    def has_next(self):
        return not self.is_finished

    def advance(self):
        line = self.file.readline()
        if not line:
            self.id = None
            self.scores = None
            self.is_finished = True
        else:
            (id_str, result_str) = line.split('\t')
            if len(id_str) < 2:
                LOGGER.warning('invalid key %s in %s' % (`id_str`, `self.path`))
                self.id = ''
            else:
                self.id = id_str[1:-1] # strip quotes
            self.should_process = should_process(id_str)
            if self.should_process:
                self.scores = self.parse_scores(result_str)

    def parse_scores(self, results_str):
        if len(results_str) < 2:
            return {}
        i = 1
        results = {}
        ranks_by_score = collections.defaultdict(list)
        results_str = results_str.replace('"', '')
        for pair in results_str.split('|'):
            pair = pair.strip()
            if not pair:
                continue
            (page_id, score) = pair.split(',')
            page_id = int(page_id)
            score = float(score)
            results[page_id] = score
            ranks_by_score[score].append(i)
            i += 1
    
        for (page_id, score) in results.items():
            rank = utils.mean(ranks_by_score[score])
            results[page_id] = 2.0 / utils.mean(ranks_by_score[score])

        return results

LINKS_MEAN = 0.02443887
LINKS_DEV = 0.028633

WORDS_MEAN = 0.0712068
WORDS_DEV = 0.056137

def link_zscore(x):
    return (x - LINKS_MEAN) / LINKS_DEV

def word_zscore(x):
    return (x - WORDS_MEAN) / WORDS_DEV

def percentile(r):
    return 1 - r / 20000.0

def sigmoid(x):
    return 1.0 / (1 - math.exp(-2 * x))

def combine_scores(names, scores):
    # normalize scores
    #if 'links' in scores:
        #scores['linksig'] = sigmoid(2 * link_zscore(scores['links']))
    #if 'words' in scores:
        #scores['wordsig'] = sigmoid(2 * word_zscore(scores['words']))
    if 'cats' in scores:
        scores['catp'] = percentile(scores['cats'])

    if len(names) < 3:
        return -1   # don't trust it!
    else:   # all 3 available
        if len(scores) == 1 and 'cats' in scores:
            return -1   # don't trust it!
        else:
            assert(len(scores) >= 1)
            return (
                5.849 + 
                5.45869 * scores.get('words', -0.05) +
                1.48050 * scores.get('links', -0.05) +
                0.90944 * scores.get('catp', -0.01)
            )

def main(input_files):
    for f in input_files:
        f.advance()

    input_files = [i for i in input_files if i.has_next()]

    while input_files:
        min_files = [i for i in input_files if i.id == min(input_files).id]
        page_id1 = min_files[0].id
        if not min_files[0].should_process:
            for f in min_files:
                f.advance()
            input_files = [i for i in input_files if i.has_next()]
            continue
        sys.stderr.write('processing %s (%d files)\n' % (page_id1, len(min_files)))

        scores_by_page = collections.defaultdict(dict)
        for f in min_files:
            assert(page_id1 == f.id and f.should_process)
            for (page_id2, score) in f.scores.items():
                scores_by_page[page_id2][f.name] = score
            f.advance()
        names = set([f.name for f in min_files])
        final_scores = {}
        for page_id2 in scores_by_page:
            final_scores[page_id2] = combine_scores(names, scores_by_page[page_id2])

        items = [(s, pid) for (pid, s) in final_scores.items()]
        items.sort()
        items.reverse()

        sys.stdout.write('"%s"\t"' % page_id1)
        for (s, pid) in items[:20000]:
            if (s, pid) != items[0]:
                sys.stdout.write('|')
            sys.stdout.write('%s,%.4f' % (pid, s))
        sys.stdout.write('\n')

        input_files = [i for i in input_files if i.has_next()]
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    main([
        ResultFile('words', 'sample/words.txt.gz'),
        ResultFile('links', 'sample/links.txt.gz'),
        ResultFile('cats', 'sample/cats.txt.gz'),
    ])
