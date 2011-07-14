<%--
  Created by shilad
  Date: Oct 3, 2010
  Time: 12:37:06 AM
  TODO: remove me after re-launch (2010/10)
--%>

<%@ page contentType="text/html;charset=UTF-8" %>

<html>
  <head><title>Macademia</title></head>
  <body>
  Dear ${person.fullName.split()[0]},

  <p>We are delighted to invite you to the all new, vastly improved <a href="${baseUrl}/account/changepassword?currentPassword=${password.encodeAsURL()}&authToken=${person.token}">Macademia website</a>!</p>

  <p>
  We'll be opening Macademia to 13 other colleges over the next few weeks, and we want you to
  update your profile.
  <b>It will only take you 5-10 minutes to read this email and update your account.</b></p>

  <p>Last summer a team of students completely revamped the site.  The new Macademia offers:
  <ul>
    <li><b>Realtime algorithms</b>.  As soon as you create or change your profile, the visualization changes!</li>
    <li><b>Support for other colleges</b>.  Over the next few weeks, we'll be opening Macademia to all 13 ACM schools.</li>
    <li><b>Enhanced profiles</b> that display a photo and web links about you.</li>
    <li><b>Collaboration requests</b>.  Looking for help on a project?  Create a collaboration request.</li>
    <li><b>Other goodies</b>.  We  improved Macademia's algorithms, user interface, and speed.</li>
  </ul>
  </p>

  <p>We want you to visit Macademia and update your profile before we open the site up to other colleges.
  Here's what Macademia knows about you:
  </p>

  <ul>
    <li>Name: <b>${person.fullName}</b></li>
    <li>Email: <b>${person.email}</b></li>
    <li>Department: <b>${person.department}</b></li>
    <li>Academic interests:
      <g:each in="${person.interests}" var="i" status="idx">
          <b>${i.text}</b><g:if test="${idx +1 != person.interests.size()}">,</g:if>
      </g:each>
    </li>
  </ul>

  <p>Consider adding your pedagogical interests, research interests, subjects you teach, etc.</p>

  <p>
    Please visit the
    <a href="${baseUrl}/account/changepassword?currentPassword=${password.encodeAsURL()}&authToken=${person.token}">
    <b>new Macademia website</b></a> and update your profile.
  </p>
  <p><br/>Thank you!</p>

  <p><b>Shilad Sen</b><br/><br/>
    and the Macademia team:
     Henry Charlton, Ryan Kerwin, Jeremy Lim, Brandon Maus, Nathaniel Miller, Meg Naminski, Alex Schneeman, Anthony Tran.
  </p>

  <p>The links to Macademia in this message are <b>your private links</b>.  Please do not share them with others.</p>

  <p>
    <br/><em>Macademia has been generously supported by
    The Associated Colleges of the Midwest,
    The Andrew W. Mellon Foundation,
    The National Science Foundation,
    and Macalester College.</em>
  </p>


  


  

  </body>
</html>