#!/bin/sh

rsync -avz \
    --exclude='**/orig/**' \
    --exclude='**/tmp/**' \
    shilad@poliwiki:usr/macademia/grails2/profileImages/ \
    ./web-app/images/db
