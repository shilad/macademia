
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
  <head>
    <title>Goodbye!</title>
  </head>
  <body>
    <div>You have completed the survey. Thank you for your time!</div>
    <g:if test="${!subject.person}">
        <div>
          Would you like to
          <g:link url="/Macademia/all/account/createuser?interests=${subject.interestsToString().encodeAsURL()}">
              sign up?
          </g:link>
        </div>
    </g:if>
    <div>
      Any extra final comments go here, such as more info on the survey, the true identity
      of the visualized people, and a reiteration of our contact information.
    </div>
  </body>
</html>