package org.macademia

class LoggingController {
    def userLoggingService

    def index = { }

    def doLog = {
        Map<String, String> logParams = [:]
        for (String key : params.keySet()) {
            def val = params[key]
            if (key == 'category' || key == 'event') {
                // skip these
            } else if (val instanceof String || val instanceof GString) {
                logParams[key] = val
            } else {
                logParams[key] = val[0]
            }
        }
        userLoggingService.logEvent(request, params.category, params.event, params)
        render('okay')
    }
}
