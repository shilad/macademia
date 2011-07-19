<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>

  <title>
    <g:if test="${user.id}">Edit Macademia Profile</g:if>
    <g:else>Create a New Macademia Profile</g:else>
  </title>

  <p:css name="createUser"/>
  <g:include view="/layouts/headers.gsp"/>
  <p:javascript src="uploadify/swfobject"/>
  <p:javascript src="uploadify/jquery.uploadify.v2.1.0.min"/>
  <p:javascript src="lib.macademia.upload"/>

  %{--TODO: Convert this link to a p:css link (unfortunately, it is in a js directory)--}%
  <link type="text/css" rel="stylesheet" href="${createLinkTo(dir: "js", file: "/uploadify/uploadify.css")}">
  <g:javascript>
    $().ready(function() {
        macademia.otherInstitutions = ${otherInstitutions};
        macademia.allInstitutions = ${allInstitutions};
        macademia.initializeRegister();
    });
  </g:javascript>
  
</head>
<body>
<div id="center_wrapper">
<a href="/Macademia/${params.group}">
  <p:image id="logoImage" src='macademia-logo-black.png'/></a>

<h2 class="center" id="registerTitle">
  <g:if test="${user.id}">Edit Macademia Profile</g:if>
  <g:else>Create a New Macademia Profile</g:else>
</h2>


<div class="instructions"><p>Macademia <span class="alert">publicly displays all the information you enter below,</span> except for your password.
<b>Thanks for joining Macademia!</b>
  <p>Macademia currently supports faculty at Macalester College.  </div>
  <form action="#" id="edit_profile" name="edit_profile" method="post">
    <div id="edit_profile_container">
        <div class="halfHeader1"><span class="alert">Required Information</span></div>

        <div id="nameErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="fullNameField">Name<span>Full Name</span></label></div>
        <div class="right topBorder"><input id="fullNameField" type="text" name="fullName" value="${user.fullName?.encodeAsHTML()}"/></div>
        <div class="clear"></div>

        <g:if test="${!user.id}">


        <div id="passErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="passField">Password<span>must be 6 or more letters</span></label></div>
        <div class="right topBorder"><input id="passField" type="password" name="pass" class="clearDefault"/></div>
        <div class="clear"></div>

        <div id="passConfirmErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="passConfirmField">Password<span>Confirm password by retyping</span></label></div>
        <div class="right topBorder"><input id="passConfirmField" type="password" name="passConfirm" class="clearDefault"/></div>
        <div class="clear"></div>

        <div id="emailErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="emailField">Email<span>College email address</span></label></div>
        <div class="right topBorder"><input id="emailField" type="text" name="email" class="clearDefault"/></div>
        <div class="clear"></div>

        </g:if>

        <div id="institutionErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="institutionField">Primary Institution<span>Name of primary institution affiliation</span></label></div>
        <div class="right topBorder"><input id="institutionField" type="text" name="institution" class="clearDefault" value="${primaryInstitution?.name?.encodeAsHTML()}"/></div>
        <div class="clear"></div>

        <div id="institutionAddressErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="institutionAddressField">Institution Web Address<span>Web address primary institution</span></label></div>
        <div class="right topBorder"><input id="institutionAddressField" type="text" name="institutionURL" class="clearDefault" value="${primaryInstitution?.webUrl?.encodeAsHTML()}"/></div>
        <div class="clear"></div>



        <div id="interestErrors" class="warning">&nbsp;</div>
        <div class="left left1 fieldLabel topBorder"><label for="editInterests">Interests<span>Academic interests, separated by <b>commas</b>.  These could be pedagogical interests, research interests, subjects you teach, etc.</span></label></div>
        <div class="right topBorder"><textarea id="editInterests" cols="20" rows="3" name="interests" class="clearDefault" prompt="">${interests}</textarea></div>
        <div class="clear"></div>
    </div>
    <div id="sidebar">

        <div class="halfHeader2">Optional Information</div>

        <div id="titleErrors" class="warning">&nbsp;</div>
        <div class="left left2 fieldLabel topBorder"><label for="titleField">Title<span>Job title</span></label></div>
        <div class="right topBorder"><input id="titleField" type="text" name="title" class="clearDefault"  value="${user.title?.encodeAsHTML()}"/></div>
        <div class="clear"></div>

        <div id="departmentErrors" class="warning">&nbsp;</div>
        <div class="left left2 fieldLabel topBorder"><label for="departmentField">Department<span>Department of college</span></label></div>
        <div class="right topBorder"><input id="departmentField" type="text" name="department" class="clearDefault" value="${user.department?.encodeAsHTML()}"/></div>
        <div class="clear"></div>


        <div class="left left2 fieldLabel topBorder"><label>Profile image</label></div>
        <div class="right topBorder">
            <g:render template="../templates/macademia/imageUploader"/>
        </div>
      <div class="clear"></div>
      <div class="otherInstitutions topBorder">
        <div class="left fieldLabel"><label>Other Institutions and Professional Groups</label></div>
        <div class="clear"></div>
        <div class="customLink customLinkTemplate">
          <div class="institutionNumber">1.</div>
          <div class="otherInstitutionField"><input type="text" class="clearDefault otherInstitutionInput" prompt="institution name" value="institution name"></div>
          <div class="otherInstitutionURL"><input type="text" class="clearDefault otherInstitutionUrlInput" prompt="institution url" value="institution url"></div>
          <div class="removeLink"><a href="#" class="removeLink"><p:image src="close_icon.gif"/></a></div>
        </div>

        <div class="customLinkCaption">
          <div class="institutionNumber">&nbsp;</div>
          <div class="linkField">eg: Macalester College</div>
          <div class="linkValue">http://www.macalester.edu</div>
        </div>

        <div class=""></div>
        <input type="hidden" name="otherInstitutions" value=""/>
        <div class="center addItemDiv" id="addInstituionDiv"><button class="addLink">add more Institutions</button></div>
      </div>


      <div class="clear"></div>
      <div class="personLinks topBorder">
        <div class="left left2 fieldLabel"><label>Links</label></div>
        <div class="clear"></div>
        <div class="customLink customLinkTemplate">
          <div class="linkNumber">1.</div>
          <div class="linkField"><input type="text" class="clearDefault" prompt="link name" value="link name"></div>
          <div class="linkValue"><input type="text" class="clearDefault" prompt="link url" value="link url"></div>
          <div class="removeLink"><a href="#" class="removeLink"><p:image src="close_icon.gif"/></a></div>
        </div>

        <div class="customLinkCaption">
          <div class="linkNumber">&nbsp;</div>
          <div class="linkField">Home, Facebook, etc.</div>
          <div class="linkValue">http://www.whitehouse.govm</div>
        </div>

        <div class=""></div>
        <input type="hidden" name="links" value="${user.links?.encodeAsHTML()}"/>
        <div class="center addItemDiv" id="addLinkDiv"><button class="addLink">add other link</button></div>
      </div>

    </div>

    <div class="clear topBorder"></div>
    <div class="progressBar"><span></span></div>

    <div id="submit_edits">
      <g:if test="${user.id}"><input type="hidden" name="id" value="${user.id}"/></g:if> 
      <input type="submit" value="Update"> or   <a href="/Macademia">Cancel</a> </div>

  </form>

  <div id="account_delete">
    <g:if test="${user.id}">
          <g:link base="/Macademia/${params.group}" controller='account' action='delete' params= "[personId: params.id]" onclick="return confirm('Are you sure you want to delete this account?')">Delete Account</g:link>
    </g:if>
  </div>


</div>



<g:render template="../templates/macademia/tagline"/>

  <g:javascript >

    $().ready(function() {
        var params = {
            'page' : 'editProfile',
            'user' : "${user.id}"
        };
        macademia.serverLog('page', 'load', params);
        $(".clearDefault").clearDefault();


    });
  </g:javascript>
</body>
</html>
