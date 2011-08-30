#!/bin/bash

macdir="$PWD"
mkdir /tmp/grasstmp 
cd /tmp/grasstmp
if which git 2>/dev/null; then
	gitcmd="git"
elif which git.cmd 2>/dev/null; then
	gitcmd="git.cmd"
else
	echo "no git found. please install and make sure it's in your path. see shilad or aaron for help"
fi
$gitcmd clone git://github.com/lukaszczerpak/grass.git  
cd grass
$gitcmd checkout grass-0.3.4
if which expect 2>/dev/null; then
	echo "#!/usr/bin/expect" > grailsup
	echo "spawn grails upgrade" >> grailsup 
	echo 'expect "(y, n)"' >> grailsup
	echo 'send "y\r"' >> grailsup
	echo 'expect eof' >> grailsup
	chmod +x grailsup
	./grailsup
	rm grailsup
else
	grails upgrade
fi

sed -i "" '36s/(!value)/(value == null)/' /tmp/grasstmp/grass/src/groovy/CompassConfiguration.groovy 2>/dev/null || \
	sed -i"" '36s/(!value)/(value == null)/' /tmp/grasstmp/grass/src/groovy/CompassConfiguration.groovy 2>/dev/null || \
	(echo "your sed is full of fail, fix src/groovy/CompassConfiguration.groovy yourself <36s/(!value)/(value == null)/> and then make the plugin and install by hand, or go find aaron or shilad" && exit 1)		
if which compass.bat; then
	sed -i"" '7s/compass/compass.bat/' /tmp/grasstmp/grass/src/groovy/CompassCompile.groovy
fi
grails package-plugin 
cd $macdir
grails install-plugin /tmp/grasstmp/grass/grails-grass-0.3.4.zip
rm -rf /tmp/grasstmp
