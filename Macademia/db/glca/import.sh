#!/bin/sh

python ./cleanup.py GLCA\ Interests\ Complete.txt GLCA-Interests-Complete-Cleaned.txt &&
python ./cleanup-new.py New-GLCA-Data.txt New-GLCA-Data-Cleaned.txt &&
(cd ../.. &&
grails prod run-script ./db/glca/create_schools.groovy &&
grails prod run-script ./scripts/LoadPeople.groovy < ./db/glca/New-GLCA-Data-Cleaned.txt
)
#grails prod run-script ./scripts/LoadPeople.groovy < ./db/glca/GLCA-Interests-Complete-Cleaned.txt &&
