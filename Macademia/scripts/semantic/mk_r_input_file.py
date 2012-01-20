import logging
import collections
import gzip
import string
import sys
import utils

LOGGER = logging.getLogger(__name__)

class ResultFile:
    def __init__(self, name, path):
        self.name = name
        self.path = path
        self.file = gzip.GzipFile(path, 'r')
        self.retained_ids = set()   # ids that should be kept
        self.id = ''
        self.scores = {}
        self.is_finished = False

    def __repr__(self):
        return '<result_file %s, id %s>' % (`self.path`, `self.id`)

    def __str__(self):
        return self.__repr__()

    def __cmp__(self, other):
        return cmp(str(self.id), str(other.id))

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
                self.id = int(id_str[1:-1]) # strip quotes
            self.should_process = (self.id in self.retained_ids)
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
            results[page_id] = (score, rank)

        return results


def main(path_gold, input_files):
    # read the gold standard dataset
    gold = collections.defaultdict(dict)
    for line in open(path_gold):
        (page_id1, page_id2, score) = map(int, line.split('\t'))
        gold[page_id1][page_id2] = score

    sys.stdout.write('n\t')
    for f in input_files:
        sys.stdout.write('%ss\t%sr\t' % (f.name, f.name))
        f.retained_ids = set(gold.keys())
        f.advance()
    sys.stdout.write('\ty\n')

    while input_files:
        page_id1 = min(input_files).id
        min_files = [i for i in input_files if i.id == page_id1]

        # should we skip these entries?
        if not min_files[0].should_process:
            for f in min_files:
                f.advance()
            input_files = [i for i in input_files if i.has_next()]
            continue

        assert(page_id1 in gold)
        sys.stderr.write('processing %s (%d files)\n' % (page_id1, len(min_files)))

        all_data = []
        for f in input_files:
            data = {}
            scores = {}
            if f in min_files: scores = f.scores
            for page_id2 in gold[page_id1]:
                if page_id2 in scores:
                    data[page_id2] = scores[page_id2]
            all_data.append(data)
            f.advance()

        for (page_id2, score) in gold[page_id1].items():
            vals = [len(min_files)]
            real_vals = 0
            for d in all_data:
                if page_id2 in d:
                    real_vals += 1
                    vals.extend(d[page_id2])
                else:
                    vals.extend(('NA', 'NA'))
            if real_vals > 0:
                vals.append(score)
                print '\t'.join(map(str, vals))

        input_files = [i for i in input_files if i.has_next()]

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    main('dat/semantic_gold.txt',
        [
            ResultFile('word', 'gold-sample/words.txt.gz'),
            ResultFile('link', 'gold-sample/links.txt.gz'),
            ResultFile('cat', 'gold-sample/cats.txt.gz'),
        ]
    )
