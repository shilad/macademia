#!/usr/bin/python

#counts stats of institution new users
#call as ./instcount.py inst start (ie ./instcount.py glca 2010-10-10) 

import time
import sys

USERLOGLOC="./logs/user.log"
LOCS={'date':0, 'user':2, 'category':5, 'event':6, 'page': 8, 'group':-1}
WANTED1={'view change password':{'category':'page', 'event':'load', 'page':'changepassword'}, 'view update profile':{'category':'page', 'event':'load', 'page':'editProfile'}}
WANTED2={'updated profile':{'category':'profile', 'event':'update'}} 


def main():
    inst = sys.argv[1] # group name (ie 'glca')
    start = sys.argv[2] # start time (year-month-day (ie '2010-10-10'))
    counts = count(inst, time.mktime(time.strptime(start, "%Y-%m-%d")))
    for stat in counts.keys():
       print stat + ": " + str(len(counts[stat].keys()))


def count(inst, start):
    counts={}
    for i in WANTED1.keys():
        counts[i]={}
    for i in WANTED2.keys():
        counts[i]={}
    counts['all']={}
    raw_log=open(USERLOGLOC)
    for entry in raw_log:
        line = entry[:-1].split('\t')
        date = time.mktime(time.strptime(line[LOCS['date']], "%Y-%m-%d %H:%M:%S,%f"))
        if date < start:
            continue
        for stat in WANTED1.keys():
            valid = True
            for i in WANTED1[stat]:
                want = WANTED1[stat][i]
                if line[LOCS[i]][-len(want):] != want:
                    valid = False
                    break
            if not valid:
                continue
            if line[LOCS['group']][len('group='):] == inst:
                user = line[LOCS['user']]
                if user == 'user=null':
                    break
                if user not in counts[stat]:
                    counts[stat][user]=0
                counts[stat][user]+=1
                if user not in counts['all']:
                    counts['all'][user]=True
        for stat in WANTED2.keys():
            valid = True
            for i in WANTED2[stat]:
                want = WANTED2[stat][i]
                if line[LOCS[i]][-len(want):] != want:
                    valid = False
                    break
            if not valid:
                continue
            user = line[LOCS['user']]
            if user == 'user=null':
                break
            if user not in counts['all']:
                continue
            elif user not in counts[stat]:
                counts[stat][user]=0
            counts[stat][user]+=1
    return counts

main()
