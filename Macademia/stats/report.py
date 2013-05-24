#!/usr/bin/python2

import time
import sys
import optparse

#--VALID LOG START TIME--
START_DATE = time.strptime("2010-11-29","%Y-%m-%d")

#--LOCATIONS--
LOGLOC={'user':'./logs/user.log'}

#--DATE--
END=time.time()
BEGIN=END-7.0*(24*60*60)

#--DEFAULT GROUP--
GROUP=""

#--Main Counters--
STATS={str(time.ctime(BEGIN))+' to '+str(time.ctime(END)):{},'all time':{}}

def splitLine(line):
    elems={}
    l=line.split('\t')
    elems['date']=l[0]
    for i in l[1:]:
        s=i.split('=',1)
        elems[s[0]]=s[1]
    return elems

def getDate(line):
    return time.mktime(time.strptime(line['date'], "%Y-%m-%d %H:%M:%S,%f"))

def checkDate(line):
    date = getDate(line)
    return (END > date and date > BEGIN)

def checkCues(cues, line):
    if len(cues)==0:
        return True
    for c in cues:
        if c[0] in line: 
            if len(c)==1:
                continue
            if len(c)>=3 and c[2]=="!=":
                if line[c[0]] != c[1]:
                    continue
            elif line[c[0]] == c[1]:
                continue
#        print "fail on", c, line
        return False
    return True

def genDateSet(line):
    if not checkDate(line):
        return ('all time',)
    else:
        return (str(time.ctime(BEGIN))+' to '+str(time.ctime(END)),'all time')

def parseUrlParams(line):
    url = line['url']
    url = url.split('?')[1]
    elems={}
    for i in url.split('&'):
        p=i.split('=')
        elems[p[0]]=p[1]
    return elems
    
def simpleAdd(name, line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name] = ['num',0]
        STATS[d][name][1]+=1

def simpleCountUnique(field,name,line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name] = ['count',set()]
        STATS[d][name][1].add(line[field])

def lengthMeanMedian(field, splitter, name, line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name] = ['mnmd',[]]
        STATS[d][name][1].append(len(line[field].split(splitter)))

def simpleBooleanPercent(test, name, line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name]=['pcnt',[0,0]]
        STATS[d][name][1][1]+=1
        if checkCues(test,line): STATS[d][name][1][0]+=1

def fTV(field, splitter, name, line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name]=['ftv',[{},d,name]]
        for i in line[field].split(splitter):
            if i not in STATS[d][name][1][0] or STATS[d][name][1][0][i]>getDate(line):
                STATS[d][name][1][0][i]=getDate(line)

def fTVPost(x):
    if x[1] == 'all time':
        return len(x[0])
    valid=0
    for i in x[0].keys():
        if x[0][i] <= STATS['all time'][x[2]][1][0][i]:
            valid +=1
    return valid

def sessTimeCalc(name, line):
    for d in genDateSet(line):
        if name not in STATS[d]: STATS[d][name]=['sess',{}]
        if line['session'] not in STATS[d][name][1]: STATS[d][name][1][line['session']]=[getDate(line),getDate(line)]
        else: STATS[d][name][1][line['session']][1]=getDate(line)

def sessPost(x):
    times = []
    for s in x.keys():
        times.append(x[s][1]-x[s][0]+(15*60))
    times=sorted(times)
    txt=str(sum(times)/len(times))
    qs=(times[len(times)/4],times[len(times)/2],times[len(times)*3/4])
    txt+=' '+str(qs)
    return txt
    

POST_PROC={
        'num':(lambda x: x),
        'count':len,
        'mnmd':(lambda x: str('%.2f'%(1.0*sum(x)/len(x)))+' / '+str(sorted(x)[len(x)/2])),
        'pcnt':(lambda x: str(100*x[0]/x[1])+' %'),
        'ftv':fTVPost,
        'sess':sessPost
        }


MODULES={
        'createdAccounts':{
            'name':'accounts created',
            'cues':(('event','create'),('category','profile')),
            'func':simpleAdd,
            'params':[]
            },

        'accountsUpdated':{
            'name':'accounts updated',
            'cues':(('event','update'),('category','profile')),
            'func':simpleAdd,
            'params':[]
            },

        'uCViews':{
            'name':'user-centric graph views',
            'cues':(('navFunction','person'),('category','nav')),
            'func':simpleAdd,
            'params':[]
            },

        'rCViews':{
            'name':'request-centric graph views',
            'cues':(('navFunction','request'),('category','nav')),
            'func':simpleAdd,
            'params':[]
            },

        'iCViews':{
            'name':'interest-centric graph views',
            'cues':(('navFunction','interest'),('category','nav')),
            'func':simpleAdd,
            'params':[]
            },
        'dRV':{
            'name':'distinct registered visitors',
            'cues':(('user','null', '!='),),
            'func':simpleCountUnique,
            'params':['user']
            },

        'dUV':{
            'name':'distinct non-registered visitors',
            'cues':(('user','null'),),
            'func':simpleCountUnique,
            'params':['ip']
            },
        'newInterestAvg':{
            'name':'mean / median interests per new account',
            'cues':(('event','create'),('category','profile')),
            'func':lengthMeanMedian,
            'params':['interests',',']
            },
        'interestsCreated':{
            'name':'new interests added',
            'cues':(('interests',),),
            'func':fTV,
            'params':['interests',',']
            },
        'requestsCreated':{
            'name':'new collaboration requests added',
            'cues':(('requestId',),),
            'func':fTV,
            'params':['requestId',',']
            },
        'autoComplete':{
            'name':'navigations via AutoComplete',
            'cues':(('ignoreLogFail',),),
            'func':simpleAdd,
            'params':[]
            },
        'searches':{
            'name':'navigation via Searches',
            'cues':(('searchBox',),('navFunction','search')),
            'func':simpleAdd,
            'params':[]
            },
        'nodeClick':{
            'name':'navigation based on link/node clicks',
            'cues':(('event','fragment'),('category','nav'),('nodeId',)),
            'func':simpleAdd,
            'params':[]
            },
        'sessionTime':{
            'name':'mean session time (seconds) and quantiles (25% / 50% / 75%)',
            'cues':(('session',),),
            'func':sessTimeCalc,
            'params':[]
            }
        }

def runLines():
    f=open(LOGLOC['user'])
    for l in f:
        line = splitLine(l)
        if not testGroup(line): continue
        for m in MODULES.keys():
            applyModule(m,line)

def testGroup(line):
    if GROUP == '':return True
    if 'group' in line:
        if line['group']==GROUP:return True
    return False

def applyModule(m,l):
    module = MODULES[m]
    if not checkCues(module['cues'],l):
        return False
    apply(module['func'], (module['params'] + [module['name']] + [l]))

def postProc():
    for d in sorted(STATS.keys()):
        for i in STATS[d].keys():
            STATS[d][i]=POST_PROC[STATS[d][i][0]](STATS[d][i][1])

def printStuff():
    for d in sorted(STATS.keys()):
        print 'Statistics for', d,':'
        print '==================================='
        for k in sorted(STATS[d].keys()):
            print '-',k+':',STATS[d][k]
        print 

def main():
    desc = "generates a Macademia Stat Report from user.log"
    parser = optparse.OptionParser(description=desc)
    parser.add_option('--start','-s',action='store', type=str, default='', help='start date (MM/DD/YY)')
    parser.add_option('--end','-e',action='store', type=str, default='', help='end date (MM/DD/YY)')
    parser.add_option('--group','-g',action='store',type=str,default='', help='limit stats to group')

    (args, ar)=parser.parse_args()

    if args.start !='':
        global BEGIN
        BEGIN=time.strptime(args.start, "%m/%d/%y")
    if args.end !='': 
        global END
        END=time.strptime(args.end, "%m/%d/%y")
    global GROUP
    GROUP=args.group

    runLines()
    postProc()
    printStuff()
    

main()
