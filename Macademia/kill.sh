ps axww | grep grails | grep 10090 | grep -v grep | awk '{ print $1 }' | xargs kill
