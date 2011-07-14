#!/bin/sh

DB=wikipediaReadOnlyTest
mongo $DB --eval "db.articleSimilarities.drop()" &&
mongo $DB --eval "db.articlesToIds.drop()" &&
gunzip < articlesToIds.txt.gz | mongoimport -d $DB -c articlesToIds &&
gunzip <./articleSimilarities.txt.gz | mongoimport -d $DB -c articleSimilarities
