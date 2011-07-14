#!/bin/bash

if [ ! -d bin ] ;then
    mkdir bin
fi

CP=./lib2/disco-1.1.jar:./lib2/JWordNetSim.jar:./lib2/jwnl.jar:./lib2/commons-logging.jar
rm -rf javabin/*
javac -d javabin/ -cp $CP `find src2/java/org/macademia/ -type f | grep '.java$'` &&
java -cp javabin/:$CP org.macademia.Tester $@
