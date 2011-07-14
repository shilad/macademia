#!/bin/bash

if [ ! -d bin ] ;then
    mkdir javabin
fi

DISCO=./lib2/disco-1.1.jar
rm -rf javabin/*
javac -d javabin/ -cp $DISCO src2/java/org/macademia/*.java src2/java/org/macademia/*/*.java &&
java -cp javabin/:$DISCO org.macademia.InterestComparer $@
