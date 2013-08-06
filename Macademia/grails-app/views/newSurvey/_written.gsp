
<div>
  <p>
      <g:if test="${question.responseRequired}">*</g:if>
      ${question.question}
  </p>
  <g:textArea name="q${question.questionNumber}" rows="10" cols="40" />
</div>