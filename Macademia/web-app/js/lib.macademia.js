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

//sets the sidebar's visibility according to original status.  Initializes jit visualization
macademia.pageLoad = function() {
    $(window).resize(function() {
        if (macademia.rgraph) {
            macademia.resizeCanvas($("#infovis").width());
        }
    });

    // address only updates manually when a link/node is clicked
    $.address.autoUpdate(false);
    $.address.change(macademia.onAddressChange);
    macademia.initialSettings();
    macademia.showHide();
    macademia.initializeLogin();
    macademia.nav();
    macademia.updateNav();
    macademia.initiateGraph();
    macademia.autocomplete.initSearch();
    macademia.toggleAccountControls();
    macademia.setupRequestCreation();
    macademia.initializeAbout();
    macademia.slider.initSlider();
    macademia.initLogging();
    macademia.changeDisplayedColleges();
};

macademia.initializeAbout = function() {
    $("#aboutJqm").jqm({modal : true, overlay : 45});
    $("#aboutJqm").jqmAddClose($("#aboutJqm .close a"));
    $("#aboutJqm").jqmAddClose($("#aboutJqm .closeImg"));
    $("#logo .about a").click(macademia.showAbout);
    $("#taglineLinks .about").click(macademia.showAbout);
    if (!macademia.getCookie('about')) {
        window.setTimeout(macademia.showAbout, 500);
        macademia.setCookie('about', "seen", 1);
    }
};

macademia.showAbout = function() {
    $("#aboutJqm").jqmShow();
    macademia.serverLog('dialog', 'show', {'name' : 'about'});
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
    if (nodeId.indexOf('p') >= 0) {
        return'person';
    } else if (nodeId.indexOf('i') >= 0) {
        return 'interest';
    } else if (nodeId.indexOf('r') >= 0) {
        return 'request';
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
        macademia.showHide();
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
};

// controls the show and hide options
macademia.showHide = function() {
    if ($.address.parameter('navVisibility') != macademia.queryString.navVisibility) {
        var navVisibility = $.address.parameter('navVisibility');
        if (navVisibility == 'true' && !$("#wrapper").is(":visible")) {
            $("#sidebar").animate({width: "320"}, "slow", function() {
                  $("#sidebar > *").show();
            });
            $("#tagContainer").animate({right: "0px"}, "slow");
//            $("#infovis").animate({right: "320"}, "slow", function() {

//            });
            // resize visual
            if (macademia.rgraph) {
                macademia.resizeCanvas($("body").width() - 320);
            }
        } else if (navVisibility == 'false' && $("#wrapper").is(":visible")) {
            $("#sidebar > *").hide();
            if (macademia.rgraph) {
                $("#sidebar").animate({width: "0"}, "slow");
                $("#tagContainer").animate({right: "0px"}, "slow");
                $("#infovis").animate({right: "0"}, "slow");
            } else {
                // on page load rightDiv will not slide over
                $("#sidebar").css('width', '0');
                $("#infovis").css('right', '0');
            }
            $("#show").show();
            // resize visual
            if (macademia.rgraph) {
                macademia.resizeCanvas($("body").width());
            }
        }
        macademia.queryString.navVisibility = navVisibility;
    }
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
    var originalWidth = 680;
    var originalHeight = 660;
    var originalDistance = 150;
    currentWidth = currentWidth - 150;
    var currentHeight = $("#infovis").height() - 30;
    if (Math.min(currentWidth, currentHeight) == currentWidth) {
        var newWidth = 0.95 * currentWidth;
        var newHeight = originalHeight * newWidth / originalWidth;
    } else {
        var newHeight = 0.95 * currentHeight;
        var newWidth = originalWidth * newHeight / originalHeight;
    }
    if (newWidth != $("#infovis-canvaswidget").css("width")) {
        $("#infovis-canvaswidget").css({"width":newWidth, "height": newHeight});
        macademia.rgraph.canvas.resize(currentWidth, currentHeight);
        macademia.rgraph.canvas.scale(newHeight/originalHeight,newWidth/originalWidth);
        macademia.rgraph.canvas.translate(0, 25);
    }
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
     macademia.clearInstructions();
     if (navFunction == 'search'){
            macademia.submitSearch();
            macademia.queryString.searchPage = $.address.parameter('searchPage');
         // go to search page
     }else if (navFunction == 'person' && $.address.parameter('personId') != macademia.queryString.personId){
         var rootId = $.address.parameter('nodeId');
         $('#personIdDiv').load(macademia.makeActionUrl('person', 'show') + '/' + rootId.slice(2));
     }else if (navFunction == 'request'){
         var rootId = $.address.parameter('nodeId');
         $('#requestIdDiv').load(macademia.makeActionUrl('request', 'show') + '/' + rootId.slice(2));
         macademia.queryString.requestId = $.address.parameter('requestId');
     }else if (navFunction == 'interest'){
         var rootId = $.address.parameter('nodeId');
         $('#interestIdDiv').load(macademia.makeActionUrl('interest', 'show') + '/' + rootId.slice(2));
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
// clears the instructions after the page has been changed by user (or if user enters exact url)
macademia.clearInstructions = function(){
    if($.address.parameter('searchBox') || $.address.parameter('personId') || $.address.parameter('interestId') || $.address.parameter('requestId')){
        $("#instruct_list").hide();
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
            $('#searchBoxDiv').load(
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
    var marker = '/Macademia/';     // string appearing before group
    var url = window.location.href;
    var i = url.indexOf(marker, 0);
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
    if (action) {
        return "/Macademia/" + group + '/' + controller + "/" + action;
    } else {
        return "/Macademia/" + group + '/' + controller;
    }
};


macademia.setupModal = function(modalDialog, trigger, url, depModule, fnString) {
//    if (!$(modalDialog).hasClass("jqmWindow")) {
        $(modalDialog).jqm({modal: true});
//    }
    $(trigger).click(function(){
        $(modalDialog).load(
                "/Macademia/" + macademia.retrieveGroup() + '/' + url,
                    function(responseText, textStatus, xmlHttpRequest) {
                        $.deps.load(depModule, function() {
                            try {
                                eval(fnString);
                            } catch (error) {
                                alert('evaluation of ' + fnString + ' failed: ' + error);
                            }
                         });
                    }
                );
        $(modalDialog).jqmShow();
    });
};

macademia.serverLog = function(category, event, params, onSuccess) {
    if (onSuccess == null) {
        //Optional funciton called when logging succeeds.
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
                alert('logging failed: ' + textStatus + ', ' + error);
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
    $("#makeRequestDialog").jqm({ajax: macademia.makeActionUrl('request', 'create'), trigger: '.makeRequestLink2',  modal: false});
    $("#listRequestDialog").jqm({ajax: macademia.makeActionUrl('request', 'list'), trigger: '.listRequestLink', modal: false});
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
            macademia.reloadToPerson(result.substring(5));
        } else {
            $("#login .flash").html(result).show();
        }
        return false;
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
        group = $.ajax({
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


macademia.getCookie = function (c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
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