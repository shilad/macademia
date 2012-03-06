import collections
import string
import sys
import utils

FRACTION_PAGES_TO_SUMMARIZE=0.01
RESULTS_SUMMARY_THRESHOLD=2

def main():
    utils.init()
    for line in sys.stdin:
        (page_id_str, results_str) = line.split('\t')
        if hash(page_id_str) % int(1/FRACTION_PAGES_TO_SUMMARIZE) != 0:
            continue
        if len(page_id_str) < 2:
            print 'invalid page key: %s' % `page_id_str`
        else:   
            page_id = int(page_id_str[1:-1])   # drop open / close quotes
            summarize(page_id, results_str.strip())

def summarize(page_id, results_str):
    print 'results for %s (id=%d)' % (utils.get_title(page_id).encode('ascii', 'ignore'), page_id)
    if len(results_str) < 2:
        print '\tno results'
        return
    i = 1
    results = []
    ranks_by_score = collections.defaultdict(list)
    for pair in results_str[1:-1].split('|'):
        (page_id2, score) = pair.split(',')
        page_id2 = int(page_id2)
        score = float(score)
        results.append([page_id2, score])
        ranks_by_score[score].append(i)
        i += 1

    ranks_to_show = set()
    r = 1
    while r <= len(results):
        for i in range(r,r+3):
            ranks_to_show.add(i)
        r *= 2
    
    ranks_to_show = [r for r in sorted(ranks_to_show) if r <= len(results)]
    for rank in ranks_to_show:
        (page_id2, score) = results[rank-1]
        tie = ''
        if len(ranks_by_score[score]) > 1:
            tie = ', %d-way tie' % len(ranks_by_score[score])
        print (u'\t%.5d: %s (id=%d, score=%.3f%s)'
                % (rank, utils.get_title(page_id2), page_id2, score, tie)).encode('utf-8')

if __name__ == '__main__':
    main()
