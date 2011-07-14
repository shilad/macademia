trap "" HUP && grails -Djava.io.tmpdir=/home/shilad/tmp -Dserver.port=10090 prod run-app >&log &

