<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/1/11
  Time: 4:49 PM
  To change this template use File | Settings | File Templates.
--%>

<g:javascript>
    $(document).ready(function() {
        $("#hideWidget").click(function(){
            $("#currentInterests").hide("fast");
            $("#showWidget").show();
            return false;
        });

        $("#showWidget").click(function(){
            $("#currentInterests").show("fast");
            $("#showWidget").hide();
            return false;
        });
    });
</g:javascript>
<div>
    <a id="showWidget" href="#">show legend</a>
    <div id="currentInterests">
        <h1>Related to <div class="rootInterestKey"></div> <div class="rootInterestName">&nbsp;</div>:</h1>
        <ol>
          <div id="sliderKey">
            <div class="lessLabel">less</div>
            <div class="okayLabel">ok</div>
            <div class="moreLabel">more</div>
          </div>
          <div id="queryInterestTemplate" class="addedInterestDiv exploration">
              <div class="interestSlider" interest="INTEREST_ID"></div>
              <div class="interestKey" interest="INTEREST_ID"></div>
              <div class="addedInterest">INTEREST_NAME&nbsp;&nbsp;&nbsp;
              <input class="addedInterestId" value="INTEREST_ID" type="hidden"/>
              </div>
          </div>
        </ol>
      <a id="hideWidget" href="#">hide</a>
    </div>
</div>


