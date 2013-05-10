<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>Exploration - Based Visualization</title>
    <meta name="layout" content="main">
    <r:require modules="queryViz"/>
</head>
<g:javascript>
  $().ready(function() {
    macademia.serverLog('nav', 'initial', {'url' : location.href });
    var offset = $("#graph").offset();
    var x = offset.left;
    var y = offset.top;
    var width = $("#graph").width();
    var height = $(window).height();
    var viz = new ExploreViz({ x : x, y : 0, width : width, height : height });
    $("#matches ol").sortable().disableSelection();
  $.address.update();
  });

</g:javascript>
<body>
  <table><tbody><tr>
    <td id="nav">
      <div>
        <div id="adjustmentWidget">
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
            </div>
        </div>

        <div id="matches">
          <h1>Best matches:</h1>
          <p>List people who best match the task described below. Drag a person listed below to reorder them.</p>
          <ol>
            <li>Miles Davis &nbsp;&nbsp;( <a href="#">view</a>&nbsp;|&nbsp;<a href="#">remove</a> )<r:img dir="/images/nbrviz" file="drag_handle.png"/></li>
            <li>John Coltrane &nbsp;&nbsp;( <a href="#">view</a>&nbsp;|&nbsp;<a href="#">remove</a> )<r:img dir="/images/nbrviz" file="drag_handle.png"/></li>
            <li>Tony Williams &nbsp;&nbsp;( <a href="#">view</a>&nbsp;|&nbsp;<a href="#">remove</a> <r:img dir="/images/nbrviz" file="drag_handle.png"/></li>
            <li>Herbie Hancock &nbsp;&nbsp;( <a href="#">view</a>&nbsp;|&nbsp;<a href="#">remove</a> ) <r:img dir="/images/nbrviz" file="drag_handle.png"/></li>
            <li>Ron Carter &nbsp;&nbsp;( <a href="#">view</a>&nbsp;|&nbsp;<a href="#">remove</a> ) <r:img dir="/images/nbrviz" file="drag_handle.png"/></li>
          </ol>
          <div>Add person: <input type="text"/></div>
        </div>

        <div id="task">
          <div>
            <h1 class="bottom">Task description:</h1>
            <p class="bottom">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse quam neque, luctus vulputate congue ac, eleifend et sapien. Donec adipiscing ultricies quam sed blandit. Duis dignissim, leo vel tristique mattis, leo neque malesuada lacus, ornare sagittis odio lorem ac urna. Ut a augue dui. Nam tempor porta nulla, vel luctus.
            </p>
          </div>
        </div>

      </div>
    </td>
    <td id="graph">&nbsp;</td>
  </tr></tbody></table>
  <g:render template="/layouts/loading"/>
</body>
</html>