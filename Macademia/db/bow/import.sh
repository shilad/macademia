#!/bin/sh

python ./cleanup1.py Babson-Olin-Faculty.txt Babson-Olin-Faculty-Cleaned.txt &&
python ./cleanup1.py WC_Fac_10-11_Apr11-email.txt WC_Fac_10-11_Apr11-email-Cleaned.txt &&
(cd ../.. &&
grails prod run-script ./db/bow/create_schools.groovy &&
grails prod run-script ./scripts/LoadPeople.groovy < ./db/bow/Babson-Olin-Faculty-Cleaned.txt &&
grails prod run-script ./scripts/LoadPeople.groovy < ./db/bow/WC_Fac_10-11_Apr11-email-Cleaned.txt
)
