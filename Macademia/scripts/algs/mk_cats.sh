#!/bin/bash

cat ./dat/categories/part* | \
egrep '^[0-9]+	c	' |
sed -e 's/\tc\t/\t/' |
sort -u -S8000M >dat/categories.txt

cat ./dat/categories/part* | \
egrep '^[0-9]+	p	' |
sed -e 's/\tp\t/\t/' |
sort -u -S8000M >dat/page_categories.txt
