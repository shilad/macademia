
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
  <head>
      <title>Create a temporary profile</title>
  </head>
  <body>
    <div>
      Create a temporary profile for use in the survey. Please enter a list of your interests,
      separated by commas (eg. interest1, interest2, interest3).
    </div>
    <g:form action="createProfile">
      <g:textArea name="interests" cols="50" rows="10"/>
      <g:submitButton name="submit" value="Submit Interests"/>
    </g:form>
  </body>
</html>