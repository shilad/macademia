#!/bin/sh
# arguments are the output files from JSONDocSim 

DB=wikipediaReadOnly

if [ $1 == "drop" ]; then
    shift;
    mongo --eval 'db.articleSimilarities.drop();' wikipediaReadOnly
fi


echo $@ | tr ' ' '\n' | sort | parallel --progress --eta -P 15 zcat "{}" "|" ./scripts/removeQuotes.py "|" mongoimport -d wikipediaReadOnly -c articleSimilarities -f _id,similarities --type tsv
