#!/bin/sh

rsync -avz \
    --exclude='**/tmp/**' \
    shilad@macademia.macalester.edu:usr/macademia/grails2/profileImages/ \
    ./profileImages
