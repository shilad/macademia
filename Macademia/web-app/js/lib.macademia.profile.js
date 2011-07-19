/**
 * Javascript for the create / edit profile pages.
 */

var macademia = macademia || {};


macademia.initializeRegister = function() {
    macademia.upload.init();
    if (macademia.isNewUser()){
        macademia.populateSchoolFromGroup();
    }

    macademia.links.init();
    macademia.initAnalyzeInterests();
    macademia.autocomplete.editInstitutionsAutocomplete();

    //macademia.autocomplete.initEditProfileInterests(); For now, no interest autocomplete

    $("#cancelAccountCreation").click(function() {
       $("#registerDialog").jqmHide(); 
    }) ;

    $('#edit_profile').submit(function() {
      try {
          $(".warning").hide();
          $(this).serialize();
          macademia.links.serialize();

          var name = $(this).find('[name=fullName]').val();
          var department = $(this).find('[name=department]').val();
          var hasError = false;

          if (name.length < 5) {
              $('#nameErrors').html("<b>Name must be provided</b>");
              $('#nameErrors').show();
              hasError=true;
          }

          // If we are in edit profile skip password and email
          if (macademia.isNewUser()) {
              var pass = $(this).find('[name=pass]').val();
              var confirm = $(this).find('[name=passConfirm]').val();
              var email = $(this).find('[name=email]').val();
              var institution = $(this).find('[name=institution]').val();
              var institutionUrl = $(this).find('[name=institutionURL]').val();
              if (pass!=confirm) {
                  $("#passConfirmErrors").html("<b>Passwords do not match</b>");
                  $("#passConfirmErrors").show();
                  hasError=true;
              }
              if (pass.length<6) {
                  $("#passErrors").html("<b>Password must be at least six characters</b>");
                  $("#passErrors").show();
                  hasError=true;

              }
              if (email.length<5) {
                  $('#emailErrors').html("<b>Valid email must be provided</b>");
                  $('#emailErrors').show();
                  hasError=true;
              }
              if (institution.length<5) {
                  $('#institutionErrors').html("<b>Valid institution must be provided</b>");
                  $('#institutionErrors').show();
                  hasError=true;
              }
              if (institutionUrl.length<5) {
                  $('#institutionAddressErrors').html("<b>Valid institution URL must be provided</b>");
                  $('#institutionAddressErrors').show();
                  hasError=true;
              }
          }
          if (hasError) {
              $('html, body').animate({scrollTop:0}, 'slow');
          } else {
              $("#submit_edits").hide();
              var interests = $('#editInterests').val().split(',');
              macademia.analyzeInterests(interests, 0, $(".progressBar"), macademia.saveUserProfile);
          }

      } catch(err) {
          alert('profile submission failed: ' + err);
      }
      return false;
  });
};

/**
 * Returns true if we are showing the create user dialog, false otherwise.
 */
macademia.isNewUser = function() {
    return ($('#edit_profile').find('[name=pass]').length > 0);
};

macademia.populateSchoolFromGroup = function() {
        jQuery.ajax({
          url: macademia.makeActionUrl('institution', 'institutionsFromGroup'),
          type: "POST",
          data: {group: macademia.retrieveGroup()},
          dataType: "json",
          success: function(data) {
              if (data.type == "group") {
                    macademia.links.addNewInstitution(data.institution, data.url);
              } else if (data.type == "school"){
                    $("#institutionField").val(data.institution);
                    $("#institutionAddressField").val(data.url);
              }
              return;
          },
          error: function(request, status, errorThrown) {
              alert('error occurred!');
              return;
          }
      });
};


macademia.saveUserProfile = function() {
   var url = macademia.makeActionUrl('account', (macademia.isNewUser() ? 'saveuser' : 'updateuser'));
    jQuery.ajax({
          url: url,
          type: "POST",
          data: $('#edit_profile').serialize(),
          dataType: "text",
          success: function(data) {
              try {
                  if (data && data.substring(0, 5) == 'okay ') {
                       macademia.reloadToPerson(data.substring(5));
                       return;
                  }
                  macademia.initAnalyzeInterests();
                  alert(data);
                  var showedErrors = false;
                  if (data.indexOf('Email') == 0) {
                      showedErrors = true;
                      $('#emailErrors').html("<b>" + data + "</b>");
                      $('#emailErrors').show();
                  }
                  if (data.indexOf('You') == 0) {
                      showedErrors = true;
                      $('#passErrors').html("<b>" + data + "</b>");
                      $('#passErrors').show();
                  }
                  if (data.indexOf('school') == 0) {
                      showedErrors = true;
                      $('#institutionErrors').html("<b>" + data + "</b>");
                      $('#institutionErrors').show();
                  }
                  if (data.indexOf("institution url") == 0){
                      showedErrors = true;
                      $("#institutionAddressErrors").html("<b>" + data +"</b>");
                      $('#institutionAddressErrors').show();
                  }
                  if (!showedErrors) {
                      $('#nameErrors').html("<b>" + macademia.htmlEncode(data) +"</b>");
                      $('#nameErrors').show();
                  }
                  $('#registerDialog').animate({scrollTop:0}, 'slow');
              } catch (err) {
                  alert('error occurred after saving user: ' + err);
                  macademia.initAnalyzeInterests();
                  return;
              }
          }, 
          error: function(request, status, errorThrown) {
              macademia.initAnalyzeInterests();
              alert('error occurred when saving user: ' + status + ', ' + errorThrown);
              return;
          }
      });
};

macademia.initAnalyzeInterests = function() {
    $("#submit_edits").show();      // in case we are recovering from a submission error.
    $(".progressBar").hide();
    $(".progressBarCaption").hide();
    $(".progressBar").progressbar({ value : 10});
};

macademia.analyzeInterests = function(interests, index, progressBar, callback) {
    if (index >= interests.length) {
        return callback();
    }
    progressBar.show();
    var i = interests[index];
    progressBar.progressbar('value', 100 * (index+1) / interests.length);
    progressBar.find("span").text("learning about '" + i + "'");
    jQuery.ajax({
          url: macademia.makeActionUrl('interest', 'analyze'),
          type: "POST",
          data: {interest : i},
          dataType: "text",
          success: function(data) {
              var relatedPage = data;   // not using this for now.
              return macademia.analyzeInterests(interests, index+1, progressBar, callback);
          },
          error: function(request, status, errorThrown) {
              macademia.initAnalyzeInterests();
              alert('error occurred when processing interest ' + i + ': ' + status + ', ' + errorThrown);
              return;
          }
      });
};

// Code for managing the links on the edit page.
macademia.links = {};
macademia.links.init = function() {
    $(".personLinks .addLink").click(
            function () {return macademia.links.addNewLink();}
        );
    $(".otherInstitutions .addLink").click(
            function () {return macademia.links.addNewInstitution();}
        );
    macademia.links.deserialize();
    $(".personLinks .clearDefault").clearDefault();
    $(".otherInstitutions .clearDefault").clearDefault();
    while ($(".personLinks .customLink:visible").length < 2) {
        macademia.links.addNewLink();
    }
    while ($(".otherInstitutions .customLink:visible").length < 2) {
        macademia.links.addNewInstitution();
    }
};

macademia.links.addNewLink = function(linkName, linkUrl) {
    var newDiv = $(".personLinks .customLinkTemplate").clone();
    newDiv.removeClass("customLinkTemplate");
     if (linkName) {
        newDiv.find('.linkField input').val(linkName);
    }
    if (linkUrl) {
        newDiv.find('.linkValue input').val(linkUrl);
    }
    $(".personLinks .customLinkCaption").before(newDiv);

    newDiv.find("a.removeLink").click(
                function () {
                    $(this).parent().parent().remove();
                    macademia.renumberLinks();
                    return false;
                }
            );
    newDiv.find('.clearDefault').clearDefault();
    newDiv.show();
    macademia.renumberLinks();
    return false;
};

macademia.links.addNewInstitution = function(linkName, linkUrl) {
    var newDiv = $(".otherInstitutions .customLinkTemplate").clone();
    newDiv.removeClass("customLinkTemplate");
     if (linkName) {
        newDiv.find('.otherInstitutionField input').val(linkName);
    }
    if (linkUrl) {
        newDiv.find('.otherInstitutionURL input').val(linkUrl);
    }

    if (linkUrl) {
        $(".otherInstitutions .customLinkTemplate").after(newDiv);
    } else {
        $(".otherInstitutions .customLinkCaption").before(newDiv);
    }

    newDiv.find("a.removeLink").click(
                function () {
                    $(this).parent().parent().remove();
                    macademia.renumberInstitutions();
                    return false;
                }
            );
    newDiv.find('.clearDefault').clearDefault();
    newDiv.show();
    macademia.renumberInstitutions();
    return false;
};

macademia.renumberLinks = function() {
    var i = 1;
    $(".personLinks .customLink ").each(function () {
        if ($(this).hasClass('customLinkTemplate')) {
            return;
        }
        $(this).find('.linkNumber').html('' + i + '.');
        i += 1;
    });
};

macademia.renumberInstitutions = function() {
    var i = 1;
    $(".otherInstitutions .customLink ").each(function () {
        if ($(this).hasClass('customLinkTemplate')) {
            return;
        }
        $(this).find('.institutionNumber').html('' + i + '.');
        i += 1;
    });
};

macademia.links.serialize = function() {
    var linkStr = "";
    $(".personLinks .customLink").each(function () {
        var name;
        // handles custom and default named fields separately.
        if ($(this).find('.linkField input').length > 0) {
            name = $(this).find('.linkField input').val();
        } else {
            name = $(this).find('.linkField').html();
        }
        var value= $(this).find('.linkValue input').val();
        if (value && value != $(this).find('.linkValue input').attr('prompt')) {
            if (value.substr(0, 7) != 'http://') {
                value = 'http://' + value;
            }
            linkStr += "<li><a href=\"" + encodeURI(value) + "\">";
            linkStr += macademia.htmlEncode(name) + "</a></li>\n";
        }
    });
    $(".personLinks input[name='links']").val(linkStr);

    var institutionArray = [];
    $(".otherInstitutions .customLink").each(function (){
        var institution;
        if ($(this).find('.otherInstitutionField input').length > 0) {
            institution = $(this).find('.otherInstitutionField input').val();
        } else {
            institution = $(this).find('.otherInstitutionField').html();
        }
        var address = $(this).find('.otherInstitutionURL input').val();
        if (address && address != $(this).find('.otherInstitutionURL input').attr('prompt')){
            institution = institution+ "#" + address + "&";
            institutionArray.push(institution);
        }
    });
    $(".otherInstitutions input[name='otherInstitutions']").val(institutionArray);
};


// TODO: remove personlinks. do smth similar for otherinstitutions?
macademia.links.deserialize = function() {
    try {
        var linksStr =$(".personLinks input[name='links']").val();
        $(linksStr).find('a').each(
            function() {
                macademia.links.addNewLink($(this).text(), decodeURI($(this).attr('href')));
            });
    } catch (err) {
        alert('error during link deserialization: ' + err);
    }

    try {
        $.each(macademia.otherInstitutions,
               function(key, value){
                    macademia.links.addNewInstitution(value.institutionName, value.institutionUrl);
               });
    } catch (err) {
        alert('error during institution deserialization: ' + err);
    }

};

macademia.otherInstitutions;
