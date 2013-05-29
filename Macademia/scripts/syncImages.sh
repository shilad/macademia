#!/bin/sh

rsync -avz \
    --exclude='**/orig/**' \
    --exclude='**/tmp/**' \
    shilad@macademia.macalester.edu:usr/macademia/grails2/profileImages/ \
    ./profileImages
