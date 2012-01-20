#!/usr/bin/python

import pymongo
import string
import sys

def main(db):
    n = 0
    num_redirects = 0
    num_disambigs = 0
    num_disambig_links = 0
    for line in sys.stdin:
        n += 1
        if n % 1000 == 0:
            sys.stderr.write('processing line %d (red=%d dab=%d/%d)\n'
                % (n, num_redirects, num_disambigs, num_disambig_links))
        tokens = map(string.strip, line.split('\t'))
        if len(tokens) < 3 or (tokens[1] == 'r' and len(tokens) < 4):
            sys.stderr.write('invalid line: %s' % `line`)
            continue

        try:
            page_id = int(tokens[0])
            code = tokens[1]
            related_titles = tokens[3:]
            related_page_ids = [ get_article_id(db, t) for t in related_titles ]
            related_page_ids = [ id for id in related_page_ids if id >= 0 ]
            if code == 'r':
                num_redirects += update_redirect(db, page_id, related_page_ids)
            elif code == 'd':
                links = update_disambig(db, page_id, related_page_ids)
                if links > 0:
                    num_disambigs += 1
                    num_disambig_links += links
            else:
                sys.stderr.write('unknown record code in line: %s\n' % `line`)
        except ValueError:
            sys.stderr.write('invalid page id in line: %s\n' % `line`)
            
    sys.stderr.write('processing %d lines (red=%d dab=%d/%d)\n'
                % (n, num_redirects, num_disambigs, num_disambig_links))

def update_redirect(db, page_id, related_ids):
    if len(related_ids) == 0:
        return 0
    elif len(related_ids) > 1:
        sys.stderr.write('more than one redirect for id: %s (%s)\n' % (page_id, related_ids))
        return 0
    redirect_id = related_ids[0]
    record = db.articlesToIds.find_one({'wpId' : page_id})
    if not record:
        return 0
    db.articlesToIds.update({'wpId' : page_id}, {'$set' : {'red' : redirect_id}})
    return 1

def update_disambig(db, page_id, related_ids):
    if len(related_ids) == 0:
        return 0
    record = db.articlesToIds.find_one({'wpId' : page_id})
    if not record:
        return 0
    db.articlesToIds.update({'wpId' : page_id}, {'$set' : {'dab' : related_ids}})
    return len(related_ids)

def get_article_id(db, name):
    name = name.replace('_', ' ')
    record = db.articlesToIds.find_one({'_id' : name})
    if record:
        return record.get('wpId')
    else:
        return -1

if __name__ == '__main__':
    if len(sys.argv) != 1:
        sys.stderr.write('usage: cat disambigs_and_redirects.txt | %0\n')
        sys.exit(1)
    cnx = pymongo.Connection('localhost')
    db = cnx['wikipediaReadOnly']
    main(db)
