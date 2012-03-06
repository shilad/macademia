#!/usr/bin/python -O

import sys


def clean(s):
    s = s.strip()
    if s and s[0] == '"':
        s = s[1:]
    if s and s[-1] == '"':
        s = s[:-1]
    s = s.strip()
    return s

for line in sys.stdin:
    tokens = line.split('\t')
    if len(tokens) == 2:
        print '%s\t%s' % (clean(tokens[0]), clean(tokens[1]))
