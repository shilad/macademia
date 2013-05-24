#!/usr/bin/python

import io
import time
import smtplib
from email.mime.text import MIMEText
import optparse

#---START TIME---
START_DATE = time.strptime("2010-11-29","%Y-%m-%d")

#---LOGS---
LOGSLOC='../logs/'

#---needed logs---
NEEDEDLOGS={'active user':('user',),
    'unique session':('user',),
    'request view':('user',),
    'request create':('user',),
    'ip':('user',),
    'update':('user',),
    'profile':('user',),
    'person view':('user',),
    'interest view':('user',),
    'search':('user',),
    'email copy':('user',)}

#---Element Locations---
LOCS={'user':{'date':0,'session':3,'ip':1,'user':2, 'active user':2, 'unique session':3, 'category':5, 'event':6, 'navFunction':10, 'node_id':8}}

#---BOT IPs---
BOT_IP_PATH='bot_ip/allbadbots.txt' #taken from iplists.com

#---date---
DATE=time.time()

#---email---
FROM='macalester.macademia@gmail.com'
TO=['poliwiki-dev@googlegoups.com']
SUBJECT='Macademia usage statistics'

#---hacks to get around poor logging---
CAT_HACKS={'email copy':{'event':'email', 'category':'copy' },'profile':{'event':'create','category':'profile'}, 'update':{'event':'update', 'category':'profile'}}
NAV_HACKS={'search':{'category':'nav', 'navFunction':'search'}, 'request view':{'category':'nav', 'navFunction':'request'}, 'person view':{'category':'nav', 'navFunction':'person'}, 'interest view':{'category':'nav', 'navFunction':'interest'}}
NAV_HACKS2={'request create':{'category':'nav', 'navFunction':'request'}}

def main():
    desc = '''Generates and sends Macademia stats
----------------------------------
Available stats:
'''
    desc += '\nall\n'
    for stat in NEEDEDLOGS.keys():
        desc += stat+'\n'
    desc +='\n'
    desc +='Adding new stats is either trivial or nearly impossible'
    parser = optparse.OptionParser(description=desc)

    parser.add_option('--pretend', '-p', action='store_true', help='only print the message that would be sent')
    parser.add_option('--From', '-F', action='store', type=str,  default=FROM, help='set the from address')
    parser.add_option('--To', '-T', nargs=len(TO),  default=TO, help='set the to addresses')
    parser.add_option('--Subject', '-S', type=str,  default=SUBJECT, help='set the subject of the email')
    parser.add_option('--log_location', '-l', type=str, default=LOGSLOC, help='path to log files')
    parser.add_option('--limit_logs', '-L', nargs=4, default=[], help='limit used logs to those listed (may make stats (more) inncorrect)')
    parser.add_option('--stats', '-s', nargs=len(NEEDEDLOGS.keys()), default=['all',], help='which stats to count')
    parser.add_option('--divisions', '-d', nargs=7, action='store', default=[7,30,90,180,365,730,999999999], help='time divisions to generate stats for')

    (args, ar)=parser.parse_args()

    stats=countStats(args.divisions, args.stats, args.log_location, set(args.limit_logs))
    text=genText(stats)
    if args.pretend:
        print text
        return
    else:
        sendMessage(text, args.To, args.From, args.Subject)
        print 'Hooray! it maybe sort of worked...'
        print "Here's what it looked like"
        print text
        return

def sendMessage(text,t=TO,f=FROM,subject='Macademia usage stats'):
    msg = MIMEText(text)
    msg['Subject'] = subject
    msg['From'] = f
    msg['To'] = t

    s = smtplib.SMTP()
    s.connect()
    s.sendmail(FROM, TO, msg.as_string())
    s.quit()


def genText(stats):
    ordered_divs=sorted(stats[stats.keys()[0]].keys())
    text='\n'
    text +=("Macademia stats for "+ time.asctime()).center(80,'-') +"\n"
    text += '\n'
    for stat in stats.keys():
        text += "-"*80+'\n'
        text += ('New '+str(stat)+'s').title().center(80)+"\n"
        text += "-"*80+'\n'
        for div in ordered_divs:
            if stat in CAT_HACKS.keys() or stat in NAV_HACKS.keys():
                x = sum(stats[stat][div].values())
            else:
                x = len(stats[stat][div].keys())
            try:
                pastdays = str(time.strftime('%Y-%m-%d', time.localtime(DATE-(int(div)*86400))))
            except ValueError:
                pastdays = 'the before time'
            text += '{0:<45} {1:^5} {2:>20}'.format('since '+ pastdays + ' (past '+ str(div) +' days) ', ' - ', str(x) +' ('+str(x/int(div))+'/day)\n')
        text += '\n'
    return text

def countStats(divs, stats, logsloc, logs_to_load):
    if 'all' in stats:
        stats=list(NEEDEDLOGS.keys())
    if not logs_to_load:
        for stat in stats:
            if stat not in NEEDEDLOGS.keys():
                continue
            logs_to_load.update(NEEDEDLOGS[stat])
    return counterSlaveSingle(logs_to_load,loadBotIPs(),divs,stats,logsloc)

def counterSlaveSingle(logs_to_load,bot_ips,divs,stats,loglocs):
    counts = {}
    for s in stats:
        counts[s]={}
        for d in divs:
            counts[s][d]={}
    for log in logs_to_load:
        raw_log=open(loglocs+log+'.log')
        for entry in raw_log:
            line = entry[:-1].split('\t')
            if line == ['']:
                break
            elems=LOCS[log]
            if 'ip' in elems and line[elems['ip']][3:] in bot_ips:
                continue
            counts=addLine(line, counts, log, divs, stats)
    return counts

def addLine(line, counts, log, divs, stats):
    elems=LOCS[log]
    date=time.mktime(time.strptime(line[LOCS[log]['date']], "%Y-%m-%d %H:%M:%S,%f"))
    datediff =1.0*(DATE - date)/(24*60*60)
    for div in divs:
        if date < time.mktime(START_DATE):
            continue
        if datediff < div:
            for stat in stats:
		statcount = counts[stat][div]
                if log in NEEDEDLOGS[stat] and stat in elems:
	            statuse = line[elems[stat]]
                    if statuse not in statcount:
                        statcount[statuse]=0
                    statcount[statuse]+=1
                if stat in CAT_HACKS.keys():
                    wanted = CAT_HACKS[stat]['event']
                    if line[elems['event']][-len(wanted):] == wanted and line[elems['category']][-len(CAT_HACKS[stat]['category']):] == CAT_HACKS[stat]['category']:
                        if wanted not in statcount.keys():
                            statcount[wanted]=0
                        statcount[wanted]+=1
                if stat in NAV_HACKS.keys() or stat in NAV_HACKS2.keys():
                    if stat in NAV_HACKS.keys():
                        hackdict=NAV_HACKS
                    else:
                        hackdict=NAV_HACKS2
                    if line[elems['category']][-len(hackdict[stat]['category']):] == hackdict[stat]['category']:
		                if line[elems['navFunction']][-len(hackdict[stat]['navFunction']):] == hackdict[stat]['navFunction']:
			                wanted = line[elems['node_id']][7:]
			                if wanted not in statcount.keys():
			                    statcount[wanted]=0
			                statcount[wanted]+=1
		    	
    return counts
	

def loadBotIPs():
	f=open(BOT_IP_PATH)
	ips=set()
	for i in f:
		if i[0] < 10 and i[-2] < 10:
			ips.add(i)
	f.close()
	return ips

main()

