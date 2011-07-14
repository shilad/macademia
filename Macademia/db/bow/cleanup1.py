#!/usr/bin/python -O

import string
import sys

input = sys.argv[1]
output = open(sys.argv[2], 'w')
for line in open(input).read().split('\r')[1:]: # split on carriage return, skip header
    line = line.replace('"', '')
    output.write(line + '\n')
output.close()
