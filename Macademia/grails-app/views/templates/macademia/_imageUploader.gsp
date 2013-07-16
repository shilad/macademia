     %{--Warning: the upload javascript relies on the class and id names below.--}%
     %{--Change them at your own risk--}%
     <div class="editPicture left">
      <div>
        <g:if test="${imgOwner?.imageSubpath}">
          <img width="50" src="/Macademia/${params.group}/image/retrieve?subPath=${imgOwner.imageSubpath}" alt="" defaultImage="${defaultImageUrl}"/>
        </g:if>
        <g:else>
          <img src="${defaultImageUrl}" width="50"  alt="" defaultImage="${defaultImageUrl}"/>
        </g:else>
      </div>
      <div class="links">
          %{--These elements must appear in exactly this order for the upload functionality to work--}%
          <a href="#" class="change">change picture</a> <span class="separator">|</span><a href="#" class="delete"> delete</a>
          <div id="imgUploader">&nbsp;</div>
      </div>
      <input type="hidden" name="imageSubpath" value="${imgOwner?.imageSubpath}"/>
    </div>

