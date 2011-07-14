<div>
  <div class="ttName medium">${interest.text}</div>
  <div class="ttDesc medium aside">
    shared by ${people.size()} faculty
    <g:if test="${people.size() == 1}">
      member.
    </g:if>
    <g:else>
      members.
    </g:else>

  </div>

  <g:if test="${related}">
  <div class="ttRel medium">
    <b>related interests:</b>
    ${related.join(', ')}
    </div>
  </g:if>
</div>