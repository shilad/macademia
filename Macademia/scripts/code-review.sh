#!/bin/bash

if [ $# -lt 1 ]; then
	echo "usage: $0 file1 file2 ...." >&2
	exit 1
fi

exec python ./scripts/upload.py -s codereview.macalester.edu -r ssen@macalester.edu  --send_mail --cc poliwiki-svn@googlegroups.com -- $@
