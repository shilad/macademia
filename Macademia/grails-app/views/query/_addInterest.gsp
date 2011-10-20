<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/1/11
  Time: 4:49 PM
  To change this template use File | Settings | File Templates.
--%>

<g:javascript>
    $(document).ready(function() {
        $("#interestQuery").editAutocomplete({
              multiple : true,
              search: function() {
                  // custom minLength
                  var term = macademia.autocomplete.extractLast(this.value);
                  if (term.length < 1) {
                      return false;
                  }
              },
              focus: function() {
                  // prevent value inserted on focus
                  return false;
              },
              select: function(event, ui) {
                  macademia.nbrviz.query.addInterestToQuery(ui.item.data[0], ui.item.value);
              }
            },  macademia.makeActionUrlWithGroup(macademia.retrieveGroup(),'autocomplete', 'index') + "?klass=relatedInterest&max=20");



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
    <a id="showWidget" href="#">show search box</a>
    <div id="currentInterests">
        <h1>Search for interests:</h1>
        <ol>
          <div id="sliderKey">
            <div class="lessLabel">less</div>
            <div class="okayLabel">ok</div>
            <div class="moreLabel">more</div>
          </div>
          <div id="queryInterestTemplate" class="addedInterestDiv">
              <div class="interestSlider" interest="INTEREST_ID"></div>
              <div class="interestKey" interest="INTEREST_ID"></div>
              <div class="addedInterest">INTEREST_NAME&nbsp;&nbsp;&nbsp;
              <input class="addedInterestId" value="INTEREST_ID" type="hidden"/>
              [<a href="#" class='removeInterest'>X</a>]
              </div>
          </div>
        </ol>
      <input id="interestQuery" type="search" name="interestQuery" placeholder="Add new interest to query"/>
      <a id="hideWidget" href="#">hide search box</a>
    </div>
</div>


