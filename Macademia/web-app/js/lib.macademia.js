"use strict";

var macademia = macademia || {};

//Ultra important line of code to change the default option for History.js to enable the hashbangs
// The url will be drastically altered if this is deleted
window.History = {options: {html4Mode: true} };

// calculates the number of properties (keys, values, etc.) for an object or associative array.
macademia.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


//holds query string values
//macademia.queryString = {
//    nodeId:'p_1',
//    navVisibility:'true',
//    navFunction:'search',
//    institutions:'all',
//    searchBox:null,
//    interestId:null,
//    personId:null,
//    requestId:null,
//    searchPage:null,
//    density:null
//};

// Initializes interactive page elements
macademia.pageLoad = function() {
    $(window).resize(function() {
        if (macademia.rgraph) {
            macademia.resizeCanvas($("#infovis").width());
        }
    });


    //Setting temp to the current page
    macademia.history.init();
    macademia.history.onUpdate(macademia.onAddressChange);
    macademia.initLogoLink();
    macademia.initializeTopNav();
    macademia.initializeLogin();
    macademia.nav();
    macademia.autocomplete.initSearch();
    macademia.toggleAccountControls();
    macademia.setupRequestCreation();
    macademia.density.initDensity();
    macademia.initLogging();
    macademia.initAsteroids();
};

macademia.homePageLoad = function() {
    macademia.initLogoLink();
    macademia.initializeTopNav();
    macademia.initializeLogin();
    macademia.autocomplete.initSearch();
    macademia.initHomeSearchSubmit();
    macademia.initInstitutionGroups();
};

macademia.initLogoLink = function() {
    $("#logo").click(function() {
        location.href = "/Macademia";
    });
};

macademia.initInstitutionGroups = function() {
    $('#consortia ul>li:first-child input').attr('checked', 'checked');
    $('#consortia a').click(
        function() {
            $("#consortia .more").fadeIn();
            $("#consortia a").hide();
        }
    )
};

macademia.getSelectedInstitutionGroup = function() {
    return $('#consortia ul li input:checked').val();
};

////sets macademia.queryString values and initial page settings
//macademia.initialSettings = function(){
//    $("#show").hide();
//    if(macademia.history.get('nodeId')){
//        macademia.queryString.nodeId = macademia.history.get('nodeId');
//    }else{
//        macademia.history.setTempValue('nodeId',macademia.queryString.nodeId);
//    }
//    if(!macademia.history.get('navVisibility')){
//        macademia.history.setTempValue('navVisibility',macademia.queryString.navVisibility);
//    }
//    if(macademia.history.get('navFunction')){
//        macademia.queryString.navFunction = macademia.history.get('navFunction');
//    }else{
//        macademia.history.setTempValue('navFunction',macademia.queryString.navFunction);
//    }
//    if(macademia.history.get('institutions')){
//        macademia.queryString.institutions = macademia.history.get('institutions');
//        if(macademia.queryString.institutions != "all"){
//            macademia.initiateCollegeString(macademia.queryString.institutions);
//        }
//    }else{
//        macademia.history.setTempValue('institutions',macademia.queryString.institutions);
//    }
////    macademia.sortParameters(macademia.queryString.navFunction);
//    macademia.history.update();
//};

//calls the init function in jitConfig
macademia.initiateGraph = function() {
    var param = macademia.history.get('nodeId');
//    console.log(param);
    var type = macademia.getType(param);
    var id = parseFloat(param.substr(2));
    var density = macademia.history.get('density') || 3;
//    console.log("Desnity in initaiateGraph: "+density);
    macademia.jit.init(type, id, density);
};

macademia.initLogging = function() {
    $("a").live("mousedown", function(){
        if (macademia.isEmailAddress($(this).text())) {
            macademia.logEmailClick($(this).text());
        }
    });

    $("body").live("copy", function(){
        if (macademia.isEmailAddress($(this).text())) {
            var words = $(this).text().split(' ');
            for (var i = 0; i < words.length; i++) {
                if (macademia.isEmailAddress(words[i])) {
                    macademia.logEmailClick(words[i]);
                }
            }
        }
    });
};


macademia.loggedEmails = macademia.loggedEmails || {};

macademia.isEmailAddress = function(word) {
    return (word.indexOf('@') >= 0);
};

macademia.logEmailClick = function(email) {
    email = macademia.trim(email);
    if (macademia.loggedEmails[email]) {
        return;
    }
    macademia.loggedEmails[email] = true;
    macademia.serverLog('copy', 'email', { 'email' : email });
};

// determines the type according to the node's id (eg p_4)
macademia.getType = function(nodeId) {
    if (nodeId.indexOf('empty') >= 0) {
        return'empty';
    } else if (nodeId.indexOf('p') >= 0) {
        return'person';
    } else if (nodeId.indexOf('i') >= 0) {
        return 'interest';
    } else if (nodeId.indexOf('r') >= 0) {
        return 'request';
    } else {
        alert('unknown node id: ' + nodeId);
    }
};
//canvas background circles
macademia.drawCircles = function(canvas, ctx) {
    var times = 2, d = macademia.jit.distance;
    var pi2 = Math.PI * 2;
    for (var i = 1; i <= times; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, i * d, 0, pi2, true);
        ctx.stroke();
        ctx.closePath();
    }
};

$.fn.clearDefault = function() {
    this.each(
        function () {
            $(this).focus(function() {
                if( $(this).val() == $(this).attr('prompt')) {
                    $(this).val("");
                }
            });
            $(this).blur(function() {
                if( !$(this).val().length ) {
                    $(this).val($(this).attr('prompt'));
                }
            });
            if (!$(this).val()) {
                $(this).val($(this).attr('prompt'));
            }
        });
    return this;
};

// changes the address when a node is clicked
macademia.navInfovis = function(node) {
    var rootId = node.id;
    var type = macademia.getType(rootId);
    console.log('setting root to ' + rootId);
    macademia.history.setTempValue('nodeId', rootId);
    if (type == 'person' && macademia.history.get('navFunction') != 'person') {
        macademia.history.setTempValue('navFunction','person');
    } else if (type == 'interest' && macademia.history.get('navFunction') != 'interest') {
        macademia.history.setTempValue('navFunction','interest');
    } else if (type == 'request' && macademia.history.get('navFunction') != 'request') {
        macademia.history.setTempValue('navFunction','request');
    }
//    macademia.sortParameters(type,rootId.substr(2));
    macademia.history.update();
};


macademia.logCurrentFragment = function() {
    // log the navigation
//    var params = {};
//    console.log(macademia.history.getTemp());
//    var keys = macademia.history.getTemp().keys;
//    for (var i = 0; i < keys.size(); i++) {
//        var key = keys[i];
//        params[key] = macademia.history.get(key);
//    }
    var params = macademia.history.getTemp();
    macademia.serverLog('nav', 'fragment', params);
};

macademia.onAddressChange = function() {
    try {
//        console.log("Address Change 1");
//        console.log(macademia.history.getOld());
//        console.log(macademia.history.get());
        macademia.updateNav();
//        console.log("Address Change 2");
//        console.log(macademia.history.getOld());
//        console.log(macademia.history.get());
        macademia.changeGraph(macademia.nodeId);
//        console.log("Address Change 3");
//        console.log(macademia.history.getOld());
//        console.log(macademia.history.get());
        macademia.changeDisplayedColleges();
//        console.log("Address Change 4");
//        console.log(macademia.history.getOld());
//        console.log(macademia.history.get());
        macademia.logCurrentFragment();
//        console.log("Address Change 5");
//        console.log(macademia.history.getOld());
//        console.log(macademia.history.get());

    } catch (err) {
        var st = printStackTrace({ e : err});
//        console.log(st.join('\n'));
        alert('error occured during state change: ' + err);
    }
};

// click navigation for the rightDiv
macademia.nav = function() {
    macademia.wireupCollegeFilter();
    macademia.history.bindAnchors($("a"));
    $('#searchForm').submit(function(){
        var search =($('#searchBox').serialize()).split('=');
        if (search[1] != 'Search+people+or+interests' && search[1] != ""){
            macademia.history.setTempValue('navFunction','search');
            macademia.history.setTempValue('searchPage', 'all_0');
            macademia.history.update();
        }
        else {
            macademia.history.setTempValue('searchBox', null);
            macademia.history.update();
        }
        return false;
    });

    $(".clearDefault").clearDefault();

    $(".sidebarSection li.more").live('click', function () {
        $(this).hide();
        $(".sidebarSection div.more").slideDown('medium');
    });
};

// Changes the visualization to new root node
macademia.changeGraph = function(nodeId){
    var lastRoot = macademia.history.getOld('nodeId');
    var currentRoot = macademia.history.get('nodeId');
    var lastInstitutions = macademia.history.getOld('institutions');
    var currentInstitutions = macademia.history.get('institutions');
    var lastDensity = macademia.history.getOld('density') || 3;
    var currentDensity = macademia.history.get('density');
//    console.log("lastRoot");
//    console.log(lastRoot);
//    console.log("currentRoot");
//    console.log(currentRoot);
//    console.log("lastInstitutions");
//    console.log(lastInstitutions);
//    console.log("currentInstitutions");
//    console.log(currentInstitutions);
//    console.log("lastDensity");
//    console.log(lastDensity);
//    console.log("currentDensity");
//    console.log(currentDensity);


    // If we can animate a transition to the new root, do it
    if (currentInstitutions == lastInstitutions
        && lastRoot != currentRoot
        && lastDensity == currentDensity
        && macademia.rgraph
        && macademia.rgraph.graph.getNode(currentRoot)) {
        macademia.rgraph.onClick(currentRoot);
    } else {
        macademia.initiateGraph();
    }
};
// resizes canvas according to original dimensions
macademia.resizeCanvas = function(currentWidth) {
    //$("#infovis").height();

    var originalWidth = 680;
    var originalHeight = 660;
    var currentHeight = $(window).height()-125;
    currentWidth=currentWidth-125;
    if (currentWidth <= currentHeight) {
        var newWidth = 0.85 * currentWidth;
        var newHeight = originalHeight * (newWidth / originalWidth);
    }
    if(currentHeight<=currentWidth) {
        var newHeight = 0.85 * currentHeight;
        var newWidth = originalWidth * (newHeight / originalHeight);
    }
    if (newWidth != $("#infovis-canvaswidget").css("width") && macademia.rgraph) {
        $("#infovis-canvaswidget").css({width:newWidth, height: newHeight,"margin-top":"4%","margin-left":"8%"});
        $("#infovis-canvaswidget").css("left","5%");
        $("#infovis-canvaswidget").css("right","5%");
        macademia.rgraph.canvas.resize(newWidth, newHeight);
        macademia.rgraph.canvas.scale(newWidth/originalWidth, newHeight/originalHeight);
    }
    //$("#infovis").height($("#infovis").height());
};


// controls view of right nav (incomplete)
macademia.updateNav = function(){
    var navFunction = macademia.history.get('navFunction');
    macademia.showDivs(navFunction);
    var rootId = macademia.history.get('nodeId');
    if (navFunction == 'search'){
        macademia.submitSearch();
//        macademia.history.setTempValue('searchPage',macademia.history.get('searchPage'));
        // go to search page
    }else if (navFunction == 'person' ){ //&& macademia.history.get('personId') != macademia.history.getOld("personId")
        if (rootId != 'p_empty') {
            $('#rightContent').load(macademia.makeActionUrl('person', 'show') + '/' + rootId.slice(2));
        }
    }else if (navFunction == 'request'){
        $('#rightContent').load(macademia.makeActionUrl('request', 'show') + '/' + rootId.slice(2));
//        macademia.history.setTempValue('requestId',macademia.history.get('requestId'));
    }else if (navFunction == 'interest'){
        //debug comments:
        //after the user click the interest name on the rightContent, it will go to this case
        //this function is only responsible for the contents on the right, which works correctly.
        $('#rightContent').load(macademia.makeActionUrl('interest', 'show') + '/' + rootId.slice(2));
    }//else if etc...
//    macademia.history.setTempValue('navFunction',navFunction);
};

// hides and shows appropriate divs in right content div
macademia.showDivs = function(type){

    var queries = ['searchBox','interestId','personId','requestId'];
    for(var i = 0; i < queries.length; i++){
        if (queries[i].indexOf(type) < 0){
            var divName = "#" + queries[i] + "Div";
            $(divName).hide();
        }else{
            var divName = "#" + queries[i] + "Div";
            if (macademia.history.get(queries[i])){
                $(divName).show();
            }else{
                $(divName).hide();
            }

        }
    }
};
// submits the search query from the url
macademia.submitSearch = function(){
    $("#searchBox").autocomplete("close");
    if((macademia.history.get('institutions') != macademia.queryString.institutions
        || macademia.history.get('searchPage') != macademia.queryString.searchPage
        || macademia.history.get('searchBox') != macademia.queryString.searchBox
        || $('#searchResults').is(':empty')) && (macademia.history.get('searchBox') != undefined
        || macademia.queryString.searchBox != null)){
        if(macademia.history.get('searchBox') != undefined){
            var searchBox = macademia.history.get('searchBox');
            var search = searchBox.replace('+', ' ');
            var institutions = macademia.history.get('institutions');
            var page = macademia.history.get('searchPage').split('_');
            var type = page[0];
            var number = page[1];
            var url = macademia.makeActionUrl('search', 'search');
            if(type != 'all'){
                url = macademia.makeActionUrl('search', 'deepsearch');
            }
            $('#rightContent').load(
                url,
                {searchBox:search,
                    institutions: institutions,
                    type: type,
                    pageNumber: number}
            );
        }else{
            $('#searchBoxDiv').empty();
        }
        macademia.queryString.searchBox = searchBox;
    }
};

macademia.retrieveGroup = function() {
    // first check the home page radio buttons.
    var group = macademia.getSelectedInstitutionGroup();
    if (group) {
        return group;
    }

    // next check the url
    var marker = '/Macademia/';     // string appearing before group
    var url = window.location.href;
    var i = url.indexOf(marker, 0);

    // finally, give up
    if (i < 0) {
        return 'all';    // default group
    }
    // find next slash
    var j = url.indexOf('/', i + marker.length + 1);
    if (j < 0) {
        return 'all';
    }
    return url.substring(i + marker.length, j);
};

macademia.makeActionUrl = function(controller, action) {
    var url =  macademia.makeActionUrlWithGroup(macademia.retrieveGroup(), controller, action);
    //console.log(url)
    return url;
};

macademia.makeActionUrlWithGroup = function(group, controller, action) {
    // This is a work around of the jquery address plugin's behavior on
    // the home page, where it sets the url to be /Macademia/#
    if (group == "#") {
        group = "all";
    }
    if (action) {
        return "/Macademia/" + group + '/' + controller + "/" + action;
    } else {
        return "/Macademia/" + group + '/' + controller;
    }
};

macademia.serverLog = function(category, event, params, onSuccess) {
    if (onSuccess == null) {
        //Optional function called when logging succeeds.
        //Not passed in every serverLog call
        onSuccess = function() {};
    }
    var url = macademia.makeActionUrl('logging', 'doLog');
    params = params || {};
    params.category = category;
    params.event = event;
    $.ajax({
        url : url,
        data : params,
        dataType : 'text',
        cache : false,
        success : function(data) {
            onSuccess();
        },
        error : function(req, textStatus, error) {
            // Changing pages can cause logs to fail, set this variable in params
            // if the log is getting through the controller but failing anyway.
            if (!params.ignoreLogFail) {
                alert('logging failed: ' + textStatus + ', ' + error);
            }
        }
    });
};


macademia.trim = function(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g,"");
};


macademia.htmlEncode = function(value){
    return $('<div/>').text(value).html();
};

macademia.htmlDecode = function(value){
    return $('<div/>').html(value).text();
};

macademia.toggleAccountControls = function() {
    $('#accountControlList').hide();
    $('#toggleControls').click(function() {
        $('#accountControlList').slideToggle();
    })
};

macademia.setupRequestCreation = function() {
    $("#makeRequestDialog").jqm({ajax: macademia.makeActionUrl('request', 'create'), trigger: '.makeRequestLink',  modal: false});
    $("#listRequestDialog").jqm({ajax: macademia.makeActionUrl('request', 'list'), trigger: '.listRequestLink', modal: false});
};

macademia.initializeTopNav = function() {
    $("nav ul ul").parent().addClass("dropdown");
    $("nav li.dropdown").hover(
        function() {
            $(this).data('hideId', null);
            $(this).find("ul").slideDown('fast').show();
            var hideId = null;
            $(this).hover(
                function() {;
                    if (hideId != null) {
                        window.clearTimeout(hideId);
                    }
                },
                function() {
                    var d = $(this);
                    hideId = window.setTimeout(function() {
                        d.find("ul").slideUp('fast');
                    }, 100);
                }
            );
        });
};

macademia.initializeLogin = function() {
    $("#login").hide();
    $("#login_link").click(function(event) {
        $("#login").slideToggle();
    });
    $("#signin").submit(function() {
        $("#login .flash").hide();
        var data = $(this).serialize();
        var result = "";

        jQuery.ajax({
            url : macademia.makeActionUrl('account', 'signin'),
            type: "POST",
            data : data,
            success:function(html){result = html;},
            error:  function(req, textStatus, error) {
                alert('login failed: ' + textStatus + ', ' + error);
            },
            async:false
        });

        if (result.substr(0, 4) == 'okay') {
//            alert("result: " + result);
            macademia.reloadToPerson(result.substring(5));
        } else {
            $("#login .flash").html(result).show();
        }
        return false;
    });

};

macademia.initHomeSearchSubmit = function() {
    $("#searchSubmit").click(function() {
        var query = $("#searchBox").val();
        $.ajax({
            // TODO: manage group
            url: "/Macademia/all/search/searchExistence",
            dataType: "json",
            data: "query="+query,
            success: function( data ) {
                if (data.res) {
                    var type = data.res['class'].split(".")[2];
                    type = type.toLowerCase();
                    macademia.history.setTempValue('nodeId', type.substring(0, 1) + "_" + data.res.id);
                    macademia.history.setTempValue('navFunction', type);
//                    location.href = '/Macademia/acm/person/jit/#'+$.address.value();
                    macademia.history.update();
                }
            }
        });
    });
};

macademia.reloadToRequest = function(rid) {
    var params = {
        institutions : 'all',
        nodeId : 'r_' + rid,
        requestId : '' + rid,
        navFunction : 'request',
        navVisibility : 'true'
    };
    var rand = Math.random();

    window.location.href = macademia.makeActionUrl('person', 'jit') + '?rand=' + rand + '#/?' + $.param(params);
};

macademia.reloadToPerson = function(pid) {
    var params = {
        institutions : 'all',
        nodeId : 'p_' + pid,
        personId : '' + pid,
        navFunction : 'person',
        navVisibility : 'true'
    };
    var rand = Math.random();
    try {
        var group = $.ajax({
            url : macademia.makeActionUrl('institution', 'primaryGroup'),
            type: "POST",
            data : {},
            success:function(html){},
            error:  function(req, textStatus, error) {
                alert('error occured while loading primary group for person with id ' + id + 'failed: ' + textStatus + ', ' + error);
            },
            async:false
        }).responseText;

        window.location.href = macademia.makeActionUrlWithGroup(group, 'person', 'jit') + '?rand=' + rand + '#/?' + $.param(params);
    } catch (err) {
        alert('error occured while loading primary group for person with id ' + id + ': ' + err);
    }

};

macademia.initAsteroids = function() {
    $("#asteroids").click(function() {
        var s = document.createElement('script');
        s.type='text/javascript';
        document.body.appendChild(s);
        s.src='http://erkie.github.com/asteroids.min.js';
        void(0);
    });
};

/**
 * FIXME: handle lists of params
 */
//macademia.getQueryParams = function() {
//    var params = {};
//    var value = $.address.queryString();
//    if (value) {
//        var tokens = value.split('&');
//        for (var i = 0; i < tokens.length; i++) {
//            var p = tokens[i].split('=');
//            params[p[0]] = p[1];
//        }
//    }
//    return params;
//};

/**
 * FIXME: handle lists of params
 */
//macademia.setQueryParams = function(params) {
//    var currentNames = $.address.parameterNames();
//    var tokens = [];
//    var appendParam = function(k, v) {
//        tokens.push(k + '=' + ((v == null) ? '' : v));
//    }
//    // make sure existing keys retain the ordering
//    for (var i = 0; i < currentNames.length; i++) {
//        var key = currentNames[i];
//        if (key in params) {
//            appendParam(key, params[key]);
//        }
//    }
//    // add new keys
//    for (key in params) {
//        if (currentNames.indexOf(key) < 0) {
//            appendParam(key, params[key]);
//        }
//    }
//    $.address.queryString(tokens.join('&'));
//};


macademia.getCookie = function (c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }

    return "";
};

macademia.setCookie = function (c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toUTCString());
};

macademia.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};