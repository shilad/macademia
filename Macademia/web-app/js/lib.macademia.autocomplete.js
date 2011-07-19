/**
 * Provides the Autocomplete widget for macademia.
 */
(function($) {

    $.fn.macademiaAutocomplete = function(settings, url) {
        var cache = {};
        var config = {
            source : function(request, response) {
                if (request.term in cache) {
                    response(cache[request.term]);
                    return;
                }


				$.ajax({
					url: url,
					dataType: "json",
					data: request,
					success: function( data ) {
                        var result = [];
                        for (var i =0; i < data.length; i++) {

                            // change the type of Collaborator Request from "collaboratorrequest" to "request" (for aesthetic purposes)
                            if (data[i][2] == "collaboratorrequest"){
                                data[i][2] = "request"    
                            }
                            if (data[i][2] == "institution"){
                                result.push({
                                    label : data[i][1],
                                    data : data[i],
                                    desc: ""
                                })
                            } else if(data[i][2] == "person"){
                                result.push({
                                    label : data[i][1],
                                    data : data[i],
                                    desc: " (" + data[i][3] + ")"
                                })
                            } else {
                                result.push({
                                    label : data[i][1],
                                    data : data[i],
                                    desc: " (" + data[i][2] + ")"
                                })
                            }
                        }
                        cache[request.term] = result;
						response(result);
					}
				})}
        };

        if (settings) $.extend(config, settings);
        this.autocomplete(config)
            .data( "autocomplete")._renderItem = function( ul, item ) {
            return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + item.desc + "</a>" )
                    .appendTo( ul );
        };
        return this;

    };

    $.fn.editAutocomplete = function(settings, url) {
        function split(val) {
                  return val.split(/,\s*/);
              }
        function extractLast(term) {
                  return split(term).pop();
              }
        var cache = {};

        var config = {
            source: function(request, response) {
                    if (request.term in cache) {
                      response(cache[request.term]);
                      return;
                    }
                      $.getJSON(url, {
                          term: extractLast(request.term)
                      }, function( data ) {
                        var result = [];
                        for (var i =0; i < data.length; i++) {
                            result.push({
                                label : data[i][1],
                                data : data[i]
                            })
                        }
                        cache[request.term] = result;
						response(result);
					});
                  }
        };

        if (settings) $.extend(config, settings);
        this.autocomplete(config);

        return this;

    };

})(jQuery);


var macademia = macademia || {};      

/**
 * Example of usage for the search box
 */
macademia.autocomplete = {};

macademia.autocomplete.initSearch = function() {
    $("#searchBox").macademiaAutocomplete(
        {
            multiple : false,
            select : function (event, ui) {
                var id = ui.item.data[0];
                var name = ui.item.data[1];
                var type = ui.item.data[2];

                $.address.parameter('nodeId', type.substring(0, 1) + "_" + id);
                $.address.parameter('navFunction', type);
                macademia.sortParameters(type, id);
                $.address.update();
                $("#searchBox").val("");
                window.setTimeout(function () {
                        $("#searchBox").blur();
                    }, 100);
                if (type=="person"){
                    macademia.serverLog('nav', 'fragment', {"nodeId":"p_"+id, "navFunction":"search", "group":macademia.retrieveGroup()});
                } else if (type=="interest"){
                    macademia.serverLog('nav', 'fragment', {"nodeId":"i_"+id, "navFunction":"search", "group":macademia.retrieveGroup()});
                } else if (type="request") {
                    macademia.serverLog('nav', 'fragment', {"nodeId":"r_"+id, "navFunction":"search", "group":macademia.retrieveGroup()});
                }
                return false;
            }
        }, macademia.makeActionUrl('autocomplete'));
};

macademia.autocomplete.split = function(val) {
    return val.split(/,\s*/);
};

macademia.autocomplete.extractLast = function(term) {
    return macademia.autocomplete.split(term).pop();
};

macademia.autocomplete.initEditProfileInterests = function() {
    $("#editInterests").editAutocomplete(
        {
          multiple : true,
          search: function() {
              // custom minLength
              var term = macademia.autocomplete.extractLast(this.value);
              if (term.length < 1) {
                  return false;
              }
          },
          focus: function() {
              // prevent value inserted on focus
              return false;
          },
          select: function(event, ui) {
              var terms = macademia.autocomplete.split( this.value );
              // remove the current input
              terms.pop();
              // add the selected item
              terms.push( ui.item.value );
              // add placeholder to get the comma-and-space at the end
              terms.push("");
              this.value = terms.join(", ");
              return false;
          }
        },  macademia.makeActionUrl('autocomplete', 'index') + "?klass=interest");

    };

// makes autocomplete for institution fields (both primary and other) in edit profile page
macademia.autocomplete.editInstitutionsAutocomplete = function() {
    var updateInstitutionForm = function(event, ui) {
        var college = ui.item.data.name;
        $(this).val(college);
        if ($(this).attr("id") == "institutionField"){
            $('#institutionAddressField').val(ui.item.data.url);
        } else {
            $(this).parent().parent().find(".otherInstitutionUrlInput").val(ui.item.data.url);
        }
        return false;
    };

    var source = [];
    $.each(macademia.allInstitutions,
        function(index, institution) {
            source.push({
                        value : institution.name,
                        data : institution
                    });
        }
    );
    $('#institutionField, .otherInstitutionInput').autocomplete({
			minLength: 0,
            delay : 50,
            source : source,
            focus: updateInstitutionForm,
            select : updateInstitutionForm
        });

    // Handle the automatic completion of primary institution
    $('#edit_profile input[name=email]').blur(
           function() {
               var email = $(this).val().toLowerCase();
               if (email && $(this).data('lastEmail') != email) {
                   $(this).data('lastEmail', email);
                   var domain = email.split('@', 2)[1];
                   for (var i = 0; i < macademia.allInstitutions.length; i++) {
                       var inst = macademia.allInstitutions[i];
                       if (inst.emailDomain == null) {
                           continue;
                       }
                       if (inst.emailDomain == domain || macademia.endsWith(domain, '.' + inst.emailDomain)) {
                            $('#institutionAddressField').val(inst.url);
                            $('#institutionField').val(inst.name);
                           return;
                       }
                   }
               }
           }
    );
};



macademia.autocomplete.initEditRequest = function() {
    $("#requestKeywordsBox").editAutocomplete(
        {
          multiple : true,
          search: function() {
              // custom minLength
              var term = macademia.autocomplete.extractLast(this.value);
              if (term.length < 1) {
                  return false;
              }
          },
          focus: function() {
              // prevent value inserted on focus
              return false;
          },
          select: function(event, ui) {
              var terms = macademia.autocomplete.split( this.value );
              // remove the current input
              terms.pop();
              // add the selected item
              terms.push( ui.item.value );
              // add placeholder to get the comma-and-space at the end
              terms.push("");
              this.value = terms.join(", ");
              return false;
          }
        },macademia.makeActionUrl('autocomplete', 'index') + "?klass=interest");
};