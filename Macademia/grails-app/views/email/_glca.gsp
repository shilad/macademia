<%@ page contentType="text/html;charset=UTF-8" %>

<html>
  <head><title>Macademia</title></head>
  <body>
  Dear ${person.fullName.split()[0]},

  <p>The GLCA’s <a href="http://glca.org/programs-groups-a-services/programs/new-directions-initiative">New Directions Initiative</a> has funded almost 200 faculty projects over the last two years.
  In the remaining two years of funding we are eager to encourage faculty to network and collaborate on
  scholarly research and curricular development projects.</p>

<p>In support of this effort GLCA has maintained a database of faculty teaching and research interests.
We recently moved that data to Macademia, a web-based application that combines an intuitive visual
interface with a powerful engine for matching interests.</p>

<p>Information about your research and teaching interests can now be found on the Macademia website after you
  <a href="${baseUrl}/account/changepassword?currentPassword=${password.encodeAsURL()}&authToken=${person.token}">
  activate your profile</a>.

<p>Here's what Macademia knows about you:</p>
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

<p>Your Macademia username is your email address. You can activate your account by clicking on the link below.
Once you have created a password, you can edit your profile:
  <a href="${baseUrl}/account/changepassword?currentPassword=${password.encodeAsURL()}&authToken=${person.token}">activate your Macademia profile</a>.</p>


<p>Please take a few minutes to visit Macademia. In addition to locating colleagues with similar interests,
you can submit a request for collaboration.  We hope you will find Macademia useful and that you will tell your colleagues about it!</p>

<p>If you have comments or questions, please contact us:</p>

<p>Simon Gray, <em>New Directions Program officer (gray@glca.org) </em><br>
Shilad Sen, <em>Assistant Professor at Macalester College and creator of Macademia, (ssen@macalester.edu)</em></p>

  <br/><hr/>
<p>The links to Macademia in this message are your <b>private links</b>. Please do not share them with others.</p>

<p><em>Macademia has been generously supported by The Associated Colleges of the Midwest, The Andrew W. Mellon Foundation,
The National Science Foundation, and Macalester College.</em></p>


  </body>
</html>