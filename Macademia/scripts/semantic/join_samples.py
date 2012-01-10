import collections
import logging
import gzip
import string
import sys
import utils

FRACTION_PAGES_TO_SUMMARIZE = 0.01
RESULTS_SUMMARY_THRESHOLD = 2

LOGGER = logging.getLogger(__name__)

def should_process(id_str):
    return hash(id_str) % int(1/FRACTION_PAGES_TO_SUMMARIZE) == 0

class ResultFile:
    def __init__(self, path, weight):
        self.path = path
        self.file = gzip.GzipFile(path, 'r')
        self.weight = weight
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
        scores = collections.defaultdict(float)
        for f in min_files:
            assert(page_id1 == f.id and f.should_process)
            for (page_id2, score) in f.scores.items():
                scores[page_id2] += f.weight * score
            f.advance()
        sys.stderr.write('processing %s (%d files)\n' % (page_id1, len(min_files)))

        items = [(s, pid) for (pid, s) in scores.items()]
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
        ResultFile('sample/words.txt.gz', 0.55),
        ResultFile('sample/links.txt.gz', 0.35),
        ResultFile('sample/cats.txt.gz', 0.1),
    ])
