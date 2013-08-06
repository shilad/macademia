
<div>
  <table>
    <tr><td>
        <g:if test="${question.responseRequired}">*</g:if>
        ${question.question}
    </td></tr>
    <g:each var="i" in="${0..<question.subDescriptors.size()}">
        <tr><td><input type="checkbox" name="q${question.questionNumber}" value="${i}"/>${question.subDescriptors[i]}</td></tr>
    </g:each>
  </table>
</div>