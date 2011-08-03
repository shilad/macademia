<%--
  Created by IntelliJ IDEA.
  User: research
  Date: 8/1/11
  Time: 4:49 PM
  To change this template use File | Settings | File Templates.
--%>

<g:javascript>
    $(document).ready(function() {


        var addNewInterest = function(interestName, id) {
            if ($("#queryIds").val() == ""){
                $("#queryIds").val(id);
            } else {
                var ids = $("#queryIds").val().split("_");
                if ($.inArray(id, ids)+1 == 0){
                    $("#queryIds").val($("#queryIds").val() +"_"+ id);
                }
            }
            $("#queryIdForm").submit();
        };

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
                  this.value = "";
                  addNewInterest(ui.item.value, ui.item.data[0]);
              }
            },  macademia.makeActionUrlWithGroup(macademia.retrieveGroup(),'autocomplete', 'index') + "?klass=interest&max=20");


        $("a.removeInterest").click(function(){
            $(this).parent().remove();
            var ids = [];
            $(".addedInterestId").each(function(i){
                ids.push($(this).parent().find(".addedInterestId").val());
            });
            var idString = ids[0];
            if (ids.length > 1){
                for (var i=1; i < ids.length; i++){
                    idString += "_"+ids[i]
                }
            }
            $("#queryIds").val(idString);
            $("#queryIdForm").submit();
         });

        $("#hideWidget").click(function(){
            $(".addedInterests").hide("fast");
            $("#showWidget").show();
        });

        $("#showWidget").click(function(){
            $(".addedInterests").show("fast");
            $("#showWidget").hide();
        })
    });
</g:javascript>
<div>
    <a id="showWidget" href="#">show search box</a>
    <div class="addedInterests">
        <label for="interestQuery"><div>Search for interests:</div></label>
        <ol>
        <g:each var="interest" in="${interests}">
            <li class="addedInterestDiv">
                <div class="addedInterest">${interest[1]}&nbsp;&nbsp;&nbsp;
                <input class="addedInterestId" value="${interest[0]}" type="hidden"/>
                [<a href="#" class='removeInterest'>X</a>]
                </div>
            </li>
        </g:each>
        </ol>
        <g:form id="queryIdForm" url="../../${group}/query/show" method="get">
            <input id="queryIds" type="hidden" value="${queryIdsString}" name="queryIds"/>
        </g:form>

    <input id="interestQuery" type="search" name="interestQuery" placeholder="Add new interest to query"/>
    <a id="hideWidget" href="#">hide search box</a>
    </div>
</div>


