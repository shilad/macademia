#!/usr/bin/python -O

import string
import sys

input = sys.argv[1]
output = open(sys.argv[2], 'w')
for line in open(input).read().split('\n')[1:]: # skip header
    line = line.replace('"', '')
    line = line.replace('\r', '')
    tokens = line.split('\t')
    if len(tokens) != 7:
        sys.stderr.write('bad line (%d tokens): %s\n' % (len(tokens), `line`))
        continue
    (name, email, college, dept, teachingInterests, scholarlyInterests, additionalInterests) = tokens
    lastName, firstName = name.split(',', 1)
    name = firstName.strip() + ' ' + lastName.strip()
    allInterests = teachingInterests + ', ' + scholarlyInterests + ', ' + additionalInterests
    outputTokens = [name, dept, email, allInterests]
    output.write(string.join(outputTokens, '\t') + '\n')
output.close()
