"use strict";

var macademia = macademia || {};

// calculates the number of properties (keys, values, etc.) for an object or associative array.
macademia.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


//holds query string values
macademia.queryString = {
    nodeId:'p_1',
    navVisibility:'true',
    navFunction:'search',
    institutions:'all',
    searchBox:null,
    interestId:null,
    personId:null,
    requestId:null,
    searchPage:null,
    density:null
};

// Initializes interactive page elements
macademia.pageLoad = function() {
    $(window).resize(function() {
        if (macademia.rgraph) {
            macademia.resizeCanvas($("#infovis").width());
        }
    });

    // address only updates manually when a link/node is clicked
    $.address.autoUpdate(false);
    $.address.change(macademia.onAddressChange);
    macademia.initLogoLink();
    macademia.initialSettings();
    macademia.initializeTopNav();
    macademia.initializeLogin();
    macademia.nav();
    macademia.updateNav();
    macademia.initiateGraph();
    macademia.autocomplete.initSearch();
    macademia.toggleAccountControls();
    macademia.setupRequestCreation();
    macademia.density.initDensity();
    macademia.initLogging();
    macademia.changeDisplayedColleges();
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

//sets macademia.queryString values and initial page settings
macademia.initialSettings = function(){
        $("#show").hide();
        if($.address.parameter('nodeId')){
            macademia.queryString.nodeId = $.address.parameter('nodeId');
        }else{
            $.address.parameter('nodeId',macademia.queryString.nodeId);
        }
        if(!$.address.parameter('navVisibility')){
            $.address.parameter('navVisibility',macademia.queryString.navVisibility);
        }if($.address.parameter('navFunction')){
            macademia.queryString.navFunction = $.address.parameter('navFunction');
        }else{
            $.address.parameter('navFunction',macademia.queryString.navFunction);
        }
        if($.address.parameter('institutions')){
            macademia.queryString.institutions = $.address.parameter('institutions');
            if(macademia.queryString.institutions != "all"){
                macademia.initiateCollegeString(macademia.queryString.institutions);
            }
        }else{
            $.address.parameter('institutions',macademia.queryString.institutions);
        }
        macademia.sortParameters(macademia.queryString.navFunction);
        $.address.update();
};

//calls the init function in jitConfig
macademia.initiateGraph = function() {
    var param = $.address.parameter('nodeId');
    var type = macademia.getType(param);
    var id = parseFloat(param.substr(2));
    var density = $.address.parameter('density');
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
    $.address.parameter('nodeId', rootId);
    if (type == 'person' && $.address.parameter('navFunction') != 'person') {
        $.address.parameter('navFunction','person');
    } else if (type == 'interest' && $.address.parameter('navFunction') != 'interest') {
        $.address.parameter('navFunction','interest');
    } else if (type == 'request' && $.address.parameter('navFunction') != 'request') {
        $.address.parameter('navFunction','request');
    }
    macademia.sortParameters(type,rootId.substr(2));
    $.address.update();
};


macademia.logCurrentFragment = function() {
    // log the navigation
    var params = {};
    var keys = $.address.parameterNames();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        params[key] = $.address.parameter(key);
    }
    macademia.serverLog('nav', 'fragment', params);
};

macademia.onAddressChange = function() {
    try {
        macademia.updateNav();
        macademia.changeGraph();
        macademia.changeDisplayedColleges();
        macademia.logCurrentFragment();
    } catch (err) {
        alert('error occured during state change: ' + err);
    }
};

// click navigation for the rightDiv
macademia.nav = function() {
    macademia.wireupCollegeFilter();
    $("a").address(function() {
        if(macademia.jit.refreshNeeded){
            var url = $(this).attr('href');
            if (url && url.length > 1) {
                if (url.indexOf("#") == 0) {
                    macademia.changeQueryString(url);
                } else {
//                    return true;    // it's a normal href
//                    window.location.href = url;
                    return true;
                }
                macademia.sortParameters($.address.parameter('navFunction'));
                $.address.update();
            }
        }
    });
    $('#searchForm').submit(function(){
        var search =($('#searchBox').serialize()).split('=');
        if (search[1] != 'Search+people+or+interests' && search[1] != ""){
            $.address.parameter('navFunction','search');
            $.address.parameter('searchPage', 'all_0');
            macademia.sortParameters('search',search[1]);
            $.address.update();
        }
        else {
            $.address.parameter('searchBox', null);
            $.address.update();
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
    if ($.address.parameter('nodeId') != macademia.queryString.nodeId && $.address.parameter('institutions') == macademia.queryString.institutions) {
        if (macademia.rgraph){
              var param = $.address.parameter('nodeId');
              if (macademia.rgraph.graph.getNode(param)) {
              // if the node is on the current graph
                macademia.rgraph.onClick(param);
                //macademia.rgraph.refresh();
              }else{
                  macademia.initiateGraph();
              }
              macademia.queryString.nodeId = param;
        }
    }else if($.address.parameter('institutions') != macademia.queryString.institutions){
        macademia.initiateGraph();
    } else if (macademia.rgraph && $.address.parameter('density') != macademia.queryString.density) {        
            macademia.initiateGraph();
    }
};
// resizes canvas according to original dimensions
macademia.resizeCanvas = function(currentWidth) {
    $("#infovis").height('');
    var originalWidth = 680;
    var originalHeight = 660;
    var currentHeight = $(window).height() - 125;
    if (currentWidth <= currentHeight) {
        var newWidth = 0.95 * currentWidth;
        var newHeight = originalHeight * newWidth / originalWidth;
    } else {
        var newHeight = 0.95 * currentHeight;
        var newWidth = originalWidth * newHeight / originalHeight;
    }
    if (newWidth !== $("#infovis-canvaswidget").css("width") && macademia.rgraph) {
        $("#infovis-canvaswidget").css({"width":newWidth, "height": newHeight});
        macademia.rgraph.canvas.resize(currentWidth, currentHeight);
        macademia.rgraph.canvas.scale(newWidth/originalWidth, newHeight/originalHeight);
    }
    $("#infovis").height($("#infovis").height());
};

// changes the Query string according link's href
macademia.changeQueryString = function(query) {
    var queryString = query.substr(3);
    var params = queryString.split('&');
    for (var i = 0; i < params.length; i++) {
        var paramValue = params[i].split('=');
        $.address.parameter(paramValue[0], paramValue[1]);
    }
};


// controls view of right nav (incomplete)
macademia.updateNav = function(){
     var navFunction = $.address.parameter('navFunction');
     macademia.showDivs(navFunction);
     if (navFunction == 'search'){
            macademia.submitSearch();
            macademia.queryString.searchPage = $.address.parameter('searchPage');
         // go to search page
     }else if (navFunction == 'person' && $.address.parameter('personId') != macademia.queryString.personId){
         var rootId = $.address.parameter('nodeId');
         if (rootId != 'p_empty') {
            $('#rightContent').load(macademia.makeActionUrl('person', 'show') + '/' + rootId.slice(2));
         }
     }else if (navFunction == 'request'){
         var rootId = $.address.parameter('nodeId');
         $('#rightContent').load(macademia.makeActionUrl('request', 'show') + '/' + rootId.slice(2));
         macademia.queryString.requestId = $.address.parameter('requestId');
     }else if (navFunction == 'interest'){
         var rootId = $.address.parameter('nodeId');
         $('#rightContent').load(macademia.makeActionUrl('interest', 'show') + '/' + rootId.slice(2));
     }//else if etc...
     macademia.queryString.navFunction = navFunction;
};

// removes unused parameters and updates used parameters
macademia.sortParameters = function(type,value){
    var queries = ['searchBox','interestId','personId','requestId'];
    for(var i = 0; i < queries.length; i++){
        if (queries[i].indexOf(type) < 0){
            if ($.address.parameter(queries[i]) || macademia.queryString[queries[i]]){
                $.address.parameter(queries[i],null);
                macademia.queryString[queries[i]] = null;
            }
        }else if (value){
                $.address.parameter(queries[i],value);
        }
    }
    if (type != 'search'){
        $.address.parameter('searchPage', null);
        macademia.queryString.searchPage = null;
    }
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
            if ($.address.parameter(queries[i])){
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
    if(($.address.parameter('institutions') != macademia.queryString.institutions || $.address.parameter('searchPage') != macademia.queryString.searchPage || $.address.parameter('searchBox') != macademia.queryString.searchBox || $('#searchResults').is(':empty')) && ($.address.parameter('searchBox') != undefined || macademia.queryString.searchBox != null)){
        if($.address.parameter('searchBox') != undefined){
            var searchBox = $.address.parameter('searchBox');
            var search = searchBox.replace('+', ' ');
            var institutions = $.address.parameter('institutions');
            var page = $.address.parameter('searchPage').split('_');
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
    return macademia.makeActionUrlWithGroup(macademia.retrieveGroup(), controller, action);
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
                    $.address.parameter('nodeId', type.substring(0, 1) + "_" + data.res.id);
                    $.address.parameter('navFunction', type);
                    macademia.sortParameters(type, data.res.id);
                    location.href = '/Macademia/acm/person/jit/#'+$.address.value();
                    $.address.update();
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
macademia.getQueryParams = function() {
    var params = {};
    var value = $.address.queryString();
    if (value) {
        var tokens = value.split('&');
        for (var i = 0; i < tokens.length; i++) {
            var p = tokens[i].split('=');
            params[p[0]] = p[1];
        }
    }
    return params;
};

/**
 * FIXME: handle lists of params
 */
macademia.setQueryParams = function(params) {
    var currentNames = $.address.parameterNames();
    var tokens = [];
    var appendParam = function(k, v) {
        tokens.push(k + '=' + ((v == null) ? '' : v));
    }
    // make sure existing keys retain the ordering
    for (var i = 0; i < currentNames.length; i++) {
        var key = currentNames[i];
        if (key in params) {
            appendParam(key, params[key]);
        }
    }
    // add new keys
    for (key in params) {
        if (currentNames.indexOf(key) < 0) {
            appendParam(key, params[key]);
        }
    }
    $.address.queryString(tokens.join('&'));
};


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