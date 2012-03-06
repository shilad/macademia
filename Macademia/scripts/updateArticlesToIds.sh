DB=wikipediaReadOnly
DUMP=dat/macademia_articles_to_ids.gz
gunzip < $DUMP | mongoimport --drop -d $DB -c articlesToIds &&
mongo $DB --eval "db.articlesToIds.ensureIndex({'wpId' : 1 })"

