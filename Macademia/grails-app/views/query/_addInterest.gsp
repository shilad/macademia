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
            $("#currentInterests").hide("fast");
            $("#showWidget").show();
        });

        $("#showWidget").click(function(){
            $("#currentInterests").show("fast");
            $("#showWidget").hide();
        });

        $(".interestKey").each(function(){
            var id = $(this).attr('interest');
            var qi = null;
            $.each(macademia.nbrviz.qv.queryInterests, function(idx, interest) {
              if (interest.id == id) {
                qi = interest;
                return false;
              } else {
                return true;
              }
            });
            if (qi == null) {
              alert('couldnt find interest with id ' + id);
            } else {
              var w = $(this).width(), h = $(this).height();
              var p = new Raphael(this, w, h);
              var s = new Sphere({
                r : Math.min(w / 2, h/2), x : w / 2, y : h/2,
                hue : qi.color, paper : p,
                xOffset : 0, yOffset : 0, name : ''
              });
            }
        })
    });
</g:javascript>
<div>
    <a id="showWidget" href="#">show search box</a>
    <div id="currentInterests">
        <h1>Search for interests:</h1>
        <ol>
        <g:each var="interest" in="${interests}">
            <div class="addedInterestDiv">
                <div class="interestKey" interest="${interest[0]}"></div>
                <div class="addedInterest">${interest[1]}&nbsp;&nbsp;&nbsp;
                <input class="addedInterestId" value="${interest[0]}" type="hidden"/>
                [<a href="#" class='removeInterest'>X</a>]
                </div>
            </div>
        </g:each>
        </ol>
        <g:form id="queryIdForm" url="../../${group}/query/show" method="get">
            <input id="queryIds" type="hidden" value="${queryIdsString}" name="queryIds"/>
        </g:form>

    <input id="interestQuery" type="search" name="interestQuery" placeholder="Add new interest to query"/>
    <a id="hideWidget" href="#">hide search box</a>
    </div>
</div>


