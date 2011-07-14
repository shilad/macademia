#!/bin/sh

if [ -z "$1" ]; then
    echo "usage: $0 institution_group_abbrev" >&2
    exit 1
fi

export PGPASSWORD=grails

psql -Ugrails -c "select email from person p, institution_group ig, institution_group_institutions igi, membership m where p.id = m.person_id and m.institution_id = igi.institution_id and igi.institution_group_id = ig.id and ig.abbrev = '$1'" macademia_prod | grep '@' | sed 's/ //g'
