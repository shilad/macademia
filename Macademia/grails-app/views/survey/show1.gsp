
<%@ page import="org.macademia.nbrviz.SurveyQuestion; org.macademia.nbrviz.RadioGroup" contentType="text/html;charset=UTF-8" %>
<html>
  <head>
    <title>Survey page ${subject.currentPage} out of 2</title>
  </head>
  <body>
    This is the first page of the survey.
    <g:form action="show">
      <g:hiddenField name="subToken" value="${subject.token}"/>
      <g:each var="question" in="${page}">
          <g:if test="${question instanceof RadioGroup}">
              <g:render template="radioGroup" model="['radioGroup':question]" />
          </g:if>
          <g:elseif test="${question.responseType == SurveyQuestion.CHECKBOX}">
              <g:render template="checkbox" model="['question':question]" />
          </g:elseif>
          <g:else>
              <g:render template="written" model="['question':question]" />
          </g:else>
      </g:each>
      <g:submitButton name="submit" value="Next"/>
    </g:form>
  </body>
</html>