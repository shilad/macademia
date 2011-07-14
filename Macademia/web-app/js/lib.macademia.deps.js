var NIMBLE_BASE = "/plugins/nimble-0.4-SNAPSHOT/dev/";

$.deps.init('/Macademia', {
    'nimble-login-register': [
        'uploadify',
    ],
    'uploadify' : [
        '/js/uploadify/swfobject.js',
        '/js/uploadify/jquery.uploadify.v2.1.0.min.js',
        '/js/uploadify/uploadify.css',
        '/js/lib.macademia.upload.js'
    ],
    'none' : [
    ]
});