// controller for the select colleges filter
macademia.wireupCollegeFilter = function() {
    $("#filterDialog").jqm({ajax:
        macademia.makeActionUrl('institution', 'filter'),
        trigger: '.collegeFilterTrigger .change',
        modal: false});
};

//Called by _collegeFilterDialog to init college filter and wire up event handler
macademia.initCollegeFilter = function() {

    $(document).ready(macademia.initIgFilter());

    macademia.serverLog('dialog', 'show', {'name' : 'collegeFilter'});
    macademia.showColleges();
    $("#editColleges .clearDefault").clearDefault();
    $("#closeCollegeFilter a").click(function(){
        $('#filterDialog').jqmHide();
        macademia.serverLog('dialog', 'cancel', {'name' : 'collegeFilter'});
        return false;
    });
    $(".college a").click(function() { //are we still using this?
        $(this).parent().parent().hide();
        return false;
    });
    $("#addCollege").click(function() {
        var college = $("#collegeSearchAuto").val();
        // notice that we do not delete the colleges from our view
        // we simple hide/show them
        $("#filterModal .collegeDiv").each(function(){
            if ($(this).text().indexOf(college) >= 0){
                $(this).show();
            }
        });
        return false;
    });
    $("#clearAllColleges").click(function() {
        $(".collegeDiv").hide();
        return false;
    });
    $("#addAllColleges").click(function() {
        macademia.hideAllSchools();
        macademia.showSchools($("#consortia").val());
        return false;
    });

    $("#selectColleges").click(function() {
        macademia.collegeSelection();
        return false;
    });
    $("#consortia").change(function(){
          macademia.hideAllSchools();
          macademia.showSchools($("#consortia").val());
          macademia.initCollegeSearch($("#consortia").val());
          return false;
    });

    macademia.initCollegeSearch();

};

//Initialize the drapdown menu for 'Select consorita' on the top of the college filter
//macademia.retrieveGroup() returns the current group contained in the url
macademia.initIgFilter = function(){
    macademia.hideAllSchools();
    var igId = macademia.getIgId(macademia.retrieveGroup());
    for (var i=0; i < document.consortiaForm.consortia.options.length; i++){
        if (document.consortiaForm.consortia.options[i].value == igId){
            document.consortiaForm.consortia.options[i].selected = true;
            break;
        }
    }
    if (macademia.history.get('institutions') == "all"){
      macademia.showSchools(igId);
    }
};

//helper class for initIgFilter function
macademia.getIgId = function(igAbbrev) {
    var igId = null;
    $.each(macademia.igMap, function(key, value){
        if (value.info.abbrev == igAbbrev){
            igId = key;
            return false;
        }
    });
    if (igId == null) {
        alert('couldnt find institution group with abbreviation ' + igAbbrev);
    }
    return igId;
};


// shows colleges that are currently selected under the filter
macademia.showColleges = function(){
    var igAbbrev = macademia.retrieveGroup();
    var igId = macademia.getIgId(igAbbrev);
    if (macademia.history.get('institutions') == 'all' && igAbbrev == 'all'){
        $(".collegeDiv").show();
    } else if (macademia.history.get('institutions') == 'all') {
        $.each(macademia.igMap[igId]["institutions"], function(index, inst) {
            $("#" + inst.id).show();
        });
    } else {
        var collegeIds = macademia.history.get('institutions').split("+");
        for (var i = 0; i < collegeIds.length; i++) {
            $("#" + collegeIds[i]).show();
        }
    }
};

// puts the selected colleges from the college filter into the address bar
macademia.collegeSelection = function() {
    var newUrl = macademia.updateIgInURL();
    var groupChanged = macademia.checkForGroupChange(newUrl);

    var colleges = new Array();
    $("#selectedColleges li").each(function() {
        if ($(this).is(':visible')) {
            colleges.push($(this).attr('institutionId'));
        }
    });

    var collegeString = macademia.createInstitutionString(colleges);
    newUrl = macademia.updateInstitutionsInUrl(newUrl, collegeString);
    var institutionChanged = (collegeString != macademia.history.get('institutions'));
    macademia.showColleges();

    //Only log if one or neither has been changed.
    // Logging when both have been changed throws the "Logging error" alert.
    if (!(groupChanged && institutionChanged)) {

        var replaceUrl = function() {
            window.location.replace(newUrl);
        };
        
        macademia.serverLog('dialog', 'close',
            {'name' : 'collegeFilter', count : colleges.length}, replaceUrl);
        $('#filterDialog').jqmHide();

    } else {
        window.location.replace(newUrl);
        $('#filterDialog').jqmHide();
    }

};

//returns a new url with the consortia selector changed
macademia.updateIgInURL = function(){

    var marker = '/Macademia/';     // string appearing before group
    var url = window.location.href;
    var i = url.indexOf(marker, 0);
    var j = url.indexOf('/', i + marker.length + 1);

    return url.substring(0, i + marker.length) + macademia.igMap[$("#consortia").val()].info.abbrev + url.substring(j, url.length);

};

//returns true if the institution group is being changed.
macademia.checkForGroupChange = function(url) {
    var currentGroup = macademia.retrieveGroup();

    var marker = '/Macademia/';
    var i = url.indexOf(marker, 0);
    var j = url.indexOf('/', i + marker.length + 1);
    var newGroup = url.substring(i + marker.length, j);

    return (currentGroup != newGroup);

};

//returns a new url with the institution string updated
macademia.updateInstitutionsInUrl = function(url, collegeString) {
    var marker = 'institutions=';
    var i = url.indexOf(marker, 0);
    var j = url.indexOf('&', i + marker.length + 1);

    return (url.substring(0, i + marker.length) + (collegeString) + url.substring(j, url.length));
};

// takes an array of college ids and creates a string to stick in the url
macademia.createInstitutionString = function(collegeArray) {
        var colleges = "";
        if (collegeArray.length == 0) {
            // if no colleges selected, default to all
            return "all";
        } else {
            for (var i = 0; i < collegeArray.length; i++) {
                if (i < collegeArray.length - 1) {
                    colleges = colleges + collegeArray[i] + '+';
                } else {
                    colleges = colleges + collegeArray[i];
                }
            }
        }

        //check if all colleges in colleges are in current institution group
        if (macademia.collegesInGroup(collegeArray)) {
            return "all";
        }

        return colleges;
};

//check if all colleges in collegeArray are in current institution group
macademia.collegesInGroup = function(collegeArray){
        var igMap = macademia.igMap;
        var currentGroup = igMap[$("#consortia").val()].info.abbrev;
        var institutionGroupPosition;

        for (var igCount in igMap) {
            if (igMap[igCount].info.abbrev == currentGroup){
                institutionGroupPosition = igCount;
                break;
            }

        }

        return (igMap[institutionGroupPosition]["institutions"].length == collegeArray.length)
};


macademia.initiateCollegeString = function(ids){
    $.getJSON(macademia.makeActionUrl('institution', 'idsToNames'), {ids: ids.replace(/\+/g, " ")}, function(institutionList) {
        macademia.changeCollegeString(institutionList);
    });
};

macademia.changeCollegeString = function(institutionNames){
    var results = "";

    var group;
    var abbrev = macademia.retrieveGroup();
    if(abbrev != "all") {
        group = " from " + abbrev + ". ";
    } else {
        group = ". ";
    }

    if(institutionNames.length == $(".collegeDiv").size() || institutionNames[0] == 'all'){
        results = "Showing all schools" + group;
    } else if (institutionNames.length == 1) {
        results = "Showing " + institutionNames[0] + group;
    } else {
        results = "Showing " + institutionNames.length + " schools" + group;
    }

    if (results != "") {
        $("#collegeFilterLink").html(results);
        macademia.wireupCollegeFilter();
    }
    macademia.history.setTempValue("institutions",macademia.history.get('institutions'));
};

macademia.changeDisplayedColleges = function(){

    if(macademia.history.get('institutions') == 'all') {
//        console.log("changeDisplayedColleges 1");
        macademia.changeCollegeString(['all']);
    } else if ($(".collegeDiv").size() > 0) {

//        console.log("changeDisplayedColleges 2");
        var collegeIds = (macademia.history.get('institutions')).split("+");
        var collegeNames = new Array();
        var igId = macademia.getGroupId();

        for (var i = 0; i < collegeIds.length; i++) {
            collegeIds[i] = collegeIds[i].split("c_")[1];
        }

        $.each(macademia.igMap[igId]["institutions"], function(key, value){
           $.each(collegeIds, function(key2, value2){
              if(parseInt(value2) == value.id) {
                  collegeNames.push(macademia.igMap[igId]["institutions"][key].name);
              }
           });
        });

        macademia.changeCollegeString(collegeNames);

    } else {
//        console.log("changeDisplayedColleges 3");
        macademia.initiateCollegeString(macademia.history.get('institutions'));
    }

};

macademia.getGroupId = function() {
    var igId = null;
    var g = macademia.retrieveGroup();
    $.each(macademia.igMap, function(key, value){
        if (value.info.abbrev == g){
            igId = key;
            return false;
        }
    });
    if (igId == null) {
        alert('group not found');
    }
    return igId;
};

macademia.initCollegeSearch = function(igId) {
    var source = [];
    var igInfo = macademia.igMap[igId ? igId : macademia.getGroupId()];
    $.each(igInfo.institutions,
        function(index, institution) {
            source.push({
                        value : institution.name,
                        data : institution
                    });
        }
    );
//    console.log('source is ' + source);
    $('#collegeSearchAuto').autocomplete({
			minLength: 0,
            delay : 50,
            source : source,
            select : function (event, ui) {
                var college = ui.item.value;
                $('#collegeSearchAuto').val(college);
                $('#addCollege').click();
                window.setTimeout(function () {
                        $("#collegeSearchAuto").val("");
                        $("#collegeSearchAuto").blur();
                    }, 100);

                return false;
            }
        });
};

macademia.hideAllSchools = function() {
    $(".collegeDiv").hide();
};

macademia.showSchools = function(igId){
        var visibleInstitutions = new Array();
        for (var i=0; i < macademia.igMap[igId]["institutions"].length; i++) {
            visibleInstitutions.push(macademia.igMap[igId]["institutions"][i]["id"]);
        }
        for (var i=0; i < visibleInstitutions.length; i++) {
            $("#c_"+visibleInstitutions[i]).show();
        }
};
