package org.macademia
/**
 * Created by IntelliJ IDEA.
 * User: isparling
 * Date: Aug 20, 2009
 * Time: 11:12:32 AM
 * To change this template use File | Settings | File Templates.
 */

public class MacademiaConstants {
    public static final File PATH_SIM_ADJUSTEMENTS = new File("db/prod/sim_adjustments.txt")
    public static final String COOKIE_NAME = "MacademiaToken"

    public static final int MAX_DEPTH = 1
    public static final COLORS = [
            "#BBF",
            "#FBB",
            "#BFB",
            "#BFF",
            "#9DF",
            "#D9F",
            "#F9D",
            "#FD9",
            "#9FD",
            "#DF9",
    ]
    public static final REQUEST_COLOR = "#00F"

    static int MAX_COOKIE_AGE =  60 * 60 * 24 * 30 * 3 // three months

    static final String LOCAL_CONFIG = "grails-app/conf/MacademiaConfig.groovy"

    static final String GROUP_DEFAULT = "acm"
    static final String GROUP_ALL = "all"

    public static final String DEFAULT_IMG = 'no_avatar.jpg'
}