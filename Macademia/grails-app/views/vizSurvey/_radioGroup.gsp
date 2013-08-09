
<div>
    <table>
      <tr>
        <td></td>
        <g:each in="${radioGroup.getCommonSubDescriptors()}">
          <td>${it}</td>
        </g:each>
      </tr>
        <g:each var="question" in="${radioGroup.radioQuestions}">
          <tr>
            <td>
                <g:if test="${question.responseRequired}">*</g:if>
                ${question.question}
            </td>
              <g:each var="i" in="${0..<question.subDescriptors.size()}">
                  <td>
                    <input type="radio" name="q${question.questionNumber}" value="${i}" />
                  </td>
              </g:each>
          </tr>
        </g:each>
    </table>
</div>