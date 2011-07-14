package org.macademia


import grails.util.Environment
import org.apache.log4j.Logger
import org.hibernate.SessionFactory
import java.security.MessageDigest
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import javax.servlet.http.Cookie

/**
 * Utility methods
 */
class Utils {
    private final static Logger log = Logger.getLogger(Utils.class)


    public static String makeUrl(String group, String type, long id) {
        return makeUrl(group, type, id, false)
    }
    public static String makeUrl(String group, String type, long id, boolean addRandom) {
        if (type != 'person' && type != 'interest' && type != 'request') {
            throw new IllegalArgumentException("type must be 'person', 'interest', or 'request'")
        }
        String randToken = addRandom ? "?random=${new Random().nextInt()}" : "" 
        return "/${group}/person/jit${randToken}/#/?nodeId=${type[0]}_${id}&navVisibility=true&navFunction=${type}&institutions=all&${type}Id=${id}"
    }

    public static String makeUrl(String group, String controller, String action, Map params) {
        String url = "/${group}/${controller}/${action}"
        if (params.id) {
            url += "/${params.id}"
        }
        int i = 0
        for (String key : params.keySet()) {
            if (!['id', 'group', 'action', 'controller'].contains(key)) {
                if (i++ == 0) {
                    url += '?'
                } else {
                    url += '&'
                }
                url += URLEncoder.encode(key) + "=" + URLEncoder.encode(params[key])
            }
        }
        return url
    }
    
    public static void safeSave(Object o) {
        safeSave(o, false)
    }
    public static void safeSave(Object o, boolean flush) {
        if( !o.save(flush : flush) ) {
            log.error("save of " + o + " failed")
            o.errors.each {
                log.error(it)
            }
            throw new RuntimeException("save of " + o + " failed")
        }
    }
    
    static def propertyInstanceMap = org.codehaus.groovy.grails.plugins.DomainClassGrailsPlugin.PROPERTY_INSTANCE_MAP
    public static void cleanUpGorm(Object sessionFactory) {
        def session = sessionFactory.currentSession
        session.flush()
        session.clear()
        propertyInstanceMap.get().clear()
    }

    public static String generateMD5(InputStream is) {
       MessageDigest digest = MessageDigest.getInstance("MD5")
       byte[] buffer = new byte[8192]
       int read = 0
       while( (read = is.read(buffer)) > 0) {
           digest.update(buffer, 0, read);
       }
       byte[] md5sum = digest.digest()
       BigInteger bigInt = new BigInteger(1, md5sum)
       return bigInt.toString(16).padLeft(32, "0")
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAddr = request.getHeader("X-Forwarded-For")
        if (ipAddr == null) {
            ipAddr = request.getRemoteAddr()
        }
        return ipAddr
    }

    public static void setAuthCookie(Person person, HttpServletRequest request, HttpServletResponse response) {
        def cookie = new Cookie(MacademiaConstants.COOKIE_NAME, person.token)
        cookie.path = "/"
        cookie.setMaxAge(MacademiaConstants.MAX_COOKIE_AGE)
        response.addCookie(cookie)
        request.authenticated = person
    }
}
