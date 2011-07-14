package org.macademia

import javax.servlet.http.HttpServletRequest
import org.apache.log4j.Logger
import com.mongodb.*

class UserLoggingService {

    DatabaseService databaseService
    static transactional = true
    static final String COLLECTION = 'sessionLog'
    static Logger userLog = Logger.getLogger('org.poliwiki.user')

    public void logEvent(HttpServletRequest request, String category, String eventName, Map<String, String> params) {

        String ip = Utils.getIpAddress(request)
        def userId = request.authenticated?.id
        String sessionId = request.session.getId()
        Date tstamp = new Date()

        // Log4j
        StringBuffer sb = new StringBuffer()
        sb.append("ip=${ip}")
        sb.append("\tuser=${userId}")
        sb.append("\tsession=${sessionId}")
        sb.append("\ttstamp=${tstamp}")
        sb.append("\tcategory=${category}")
        sb.append("\tevent=${eventName}")

        for (String key : params.keySet()) {
            key = key.replaceAll("\\s+", " ")
            String value = params[key].replaceAll("\\s+", " ")
            sb.append("\t")
            sb.append(key)
            sb.append("=")
            sb.append(value)
        }
        userLog.debug(sb.toString())

        // Mongo (requires a session id)
        DB db = databaseService.getDb()
        if (sessionId == null || sessionId.length() == 0) {
            log.error('No sessionId for user ${userId} from ip ${ip}, cannot log data')
            return
        }
        DBCollection coll = db.getCollection(COLLECTION)
        DBObject fieldsDbo = BasicDBObjectBuilder.start()
                            .add("user", '' + userId)
                            .add("ip", ip)
                            .add("tstamp", tstamp)
                            .get()
        DBObject logDbo = BasicDBObjectBuilder.start()
                            .add("category", category)
                            .add("event", eventName)
                            .add("params", new BasicDBObject(params))
                            .add("tstamp",tstamp)
                            .get()
        DBObject overallDbo = BasicDBObjectBuilder.start()
                            .add('$push', new BasicDBObject("log", logDbo))
                            .add('$set', fieldsDbo)
                            .get()
        coll.update(
                new BasicDBObject("_id", sessionId),
                overallDbo,
                true,
                false
        )
    }
}
