#!/bin/bash

export PGPASSWORD=grails
export PATH=/Library/PostgreSQL/8.4/bin/:/Users/shilad/Downloads/mongodb-osx-x86_64-1.4.4/bin:$PATH

MONGO_BACKUP=./db/prod.db.mongo
MONGO_WP_BACKUP=./db/prod.db.mongo.wp
MONGO_WP_BACKUP_TEST=./db/prod.db.mongo.wp.test
PSQL_BACKUP=./db/prod.db.psql
WWW_DIR=/data/shilad/www/data

KEYFILE=./scripts/.dumpkey

if ! [ -f $KEYFILE ]; then
    echo "No key found in $KEYFILE."
    exit 1
fi

if ! [ -d $MONGO_BACKUP ]; then
    mkdir $MONGO_BACKUP
fi
if ! [ -d $MONGO_WP_BACKUP ]; then
    mkdir $MONGO_WP_BACKUP
fi
if ! [ -d $MONGO_WP_BACKUP_TEST ]; then
    mkdir $MONGO_WP_BACKUP_TEST
fi

#grails extract-prod-wp &&
pg_dump -U grails macademia_prod -f $PSQL_BACKUP && \
mongodump --db macademia_prod -o $MONGO_BACKUP && \
mongodump --db wikipediaReadOnlySmall -o $MONGO_WP_BACKUP && \
mongodump --db wikipediaReadOnlyTest -o $MONGO_WP_BACKUP_TEST && \
tar -cpz $PSQL_BACKUP | openssl aes-256-cbc -pass file:$KEYFILE >$WWW_DIR/`basename $PSQL_BACKUP`.tar.z && \
tar -cpz $MONGO_BACKUP | openssl aes-256-cbc -pass file:$KEYFILE >$WWW_DIR/`basename $MONGO_BACKUP`.tar.z && \
tar -cpz $MONGO_WP_BACKUP | openssl aes-256-cbc -pass file:$KEYFILE >$WWW_DIR/`basename $MONGO_WP_BACKUP`.tar.z && \
tar -cpz $MONGO_WP_BACKUP_TEST | openssl aes-256-cbc -pass file:$KEYFILE >$WWW_DIR/`basename $MONGO_WP_BACKUP_TEST`.tar.z ||
    { echo "backup failed!">&2; exit 1; }
