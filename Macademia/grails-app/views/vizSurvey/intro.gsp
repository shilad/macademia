
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
  <head>
    <title>Macademia Survey</title>
  </head>
  <body>
    <div>
        <p>
          Welcome the user to the survey
        </p>
        <p>
          Give the user some basic information on the survey, such as what it will ask and
          how long it will take.
        </p>
        <g:if test="${!subject}">
          You will be required to provide some information on your academic interests in order
          to participate in the survey.
        </g:if>
        <p>
          Some disclaimer information, and how their privacy will be handled.
        </p>
        <div>
            <g:link controller="newSurvey" action="applyConsent"
                params='[consent: true, subToken: "${subject ? subject.token : null}"]'>Yes</g:link>
            <g:link controller="newSurvey" action="applyConsent"
                params='[consent: false, subToken: "${subject ? subject.token : null}"]'>No</g:link>
        </div>
    </div>
  </body>
</html>