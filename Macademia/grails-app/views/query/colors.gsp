<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>NbrViz Color Tester</title>
  <g:render template="/layouts/headers"/>
  <p:javascript src='macademia.js.nbrviz'/>
  <link rel="stylesheet" type="text/css" href="../css/queryViz.css" />
  <style type="text/css">
    span {
      padding: 5px;
      font-size : 20px;
      display : inline-block;
      text-align : center;
    }
  </style>

</head>


<g:javascript>
var NVZ = macademia.nbrviz;

function appendColoredSpan(parentDiv, content, hue) {
  var span =$("<span>" + content + "</span>");
  span.addClass("removable");
  span.css('color', Raphael.hsb(hue, 1.0, 1.0));
  $(parentDiv).append(span);
}

function showColorsForIds(ids, parentDiv) {
  $(parentDiv).find('.removable').remove();
    for (var i = 0; i < ids.length; i++) {
        var hue = NVZ.getColor(ids[i]);
        appendColoredSpan(parentDiv, ids[i], hue);
    }
}

// override cookie serialization.
FAKE_COOKIE = {};
NVZ.loadColorsFromCookie = function() {
  console.log('returning ' + FAKE_COOKIE);
  return FAKE_COOKIE;
};
NVZ.saveColorsToCookie = function(colors) {
  FAKE_COOKIE = colors;
};

$().ready(function() {
  $("#changeColors").submit(
  function() {
        var text = $(this).find("input").val();
        var letters = text.split('');
        NVZ.assignColors(letters);
        showColorsForIds(letters, $("#currentSet"));
        showColorsForIds(
                $.map(FAKE_COOKIE, function (v, k) { return k; }),
                $("#allColors"));
        showColorsForIds(NVZ.colorStack, $("#colorStack"));
  });
});

</g:javascript>


<body>
  <div id="newSet">
    <form  id="changeColors" action="#">
    <span>Change current set of colors:</span><input type="text"/>
    </form>
  </div>
  <div id="currentSet">
    <span>Current set of colors:</span>
  </div>
  <div id="allColors">
    <span>All colors:</span>
  </div>
  <div id="colorStack">
    <span>Color stack:</span>
  </div>
</body>
</html>