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
            "#99F",
            "#F99",
            "#9F9",
            "#FF9",
            "#9FF",
            "#7BF",
            "#B7F",
            "#F7B",
            "#FB7",
            "#7FB",
            "#BF7",
    ]


    static int MAX_COOKIE_AGE =  60 * 60 * 24 * 30 * 3 // three months

    static final String LOCAL_CONFIG = "grails-app/conf/MacademiaConfig.groovy"

    static final String DEFAULT_GROUP = "acm"
}