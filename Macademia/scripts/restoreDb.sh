#!/bin/bash

export PGPASSWORD=grails
export PATH=/Library/PostgreSQL/8.4/bin/:/Users/shilad/Downloads/mongodb-osx-x86_64-1.4.4/bin:/opt/local/lib/postgresql90/bin:$PATH

set +x

URL_PREFIX=http://poliwiki.macalester.edu/shilad/data
MONGO_BACKUP=./db/prod.db.mongo
MONGO_WP_BACKUP=./db/prod.db.mongo.wp
MONGO_WP_BACKUP_TEST=./db/prod.db.mongo.wp.test
PSQL_BACKUP=./db/prod.db.psql

PSQL_DB=macademia_prod
MONGO_DB=macademia_prod
MONGO_DB_WP_SRC=wikipediaReadOnlySmall
MONGO_DB_WP_DEST=wikipediaReadOnly
MONGO_DB_WP_TEST=wikipediaReadOnlyTest

if ! [ -d $MONGO_BACKUP ]; then
    mkdir $MONGO_BACKUP
fi
if ! [ -d $MONGO_WP_BACKUP ]; then
    mkdir $MONGO_WP_BACKUP
fi
if ! [ -d $MONGO_WP_BACKUP_TEST ]; then
    mkdir $MONGO_WP_BACKUP_TEST
fi

read -p "user name:"  uname
stty -echo
read -p "Pass:" pass
stty echo

wget --user="$uname" --password="$pass" $URL_PREFIX/`basename $MONGO_BACKUP`.tar.z -O - | openssl aes-256-cbc -d -pass pass:"$pass" | tar -xpzf - && \
wget --user="$uname" --password="$pass" $URL_PREFIX/`basename $MONGO_WP_BACKUP_TEST`.tar.z -O - | openssl aes-256-cbc -d -pass pass:"$pass" | tar -xpzf - && \
wget --user="$uname" --password="$pass" $URL_PREFIX/`basename $MONGO_WP_BACKUP`.tar.z -O - | openssl aes-256-cbc -d -pass pass:"$pass" | tar -xpzf - && \
wget --user="$uname" --password="$pass" $URL_PREFIX/`basename $PSQL_BACKUP`.tar.z -O - | openssl aes-256-cbc -d -pass pass:"$pass" | tar -xpzf - ||
    { echo "retrieval of dbs failed" >&2; exit 1; }

unset uname
unset pass

rm -rf $MONGO_WP_BACKUP/$MONGO_DB_WP_DEST
dropdb -U grails $PSQL_DB >&/dev/null

mv $MONGO_WP_BACKUP/$MONGO_DB_WP_SRC $MONGO_WP_BACKUP/$MONGO_DB_WP_DEST && \
createdb -U grails $PSQL_DB && \
psql -U grails -d $PSQL_DB < $PSQL_BACKUP && \
mongorestore -d $MONGO_DB --drop $MONGO_BACKUP/$MONGO_DB && \
mongorestore -d $MONGO_DB_WP_TEST --drop $MONGO_WP_BACKUP_TEST/$MONGO_DB_WP_TEST && \
mongorestore -d $MONGO_DB_WP_DEST --drop $MONGO_WP_BACKUP/$MONGO_DB_WP_DEST ||
    { echo "importing of dbs failed" >&2; exit 1; }

mongo --eval 'db.users.ensureIndex({'interests' : 1});' $MONGO_DB && \
mongo --eval 'db.articlesToIds.ensureIndex({'wpId' : 1});' $MONGO_DB_WP_DEST ||
    { echo "mongodb index creation failed" >&2; exit 1; }

