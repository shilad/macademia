 <%--
  Created by IntelliJ IDEA.
  User: isparling
  Date: Aug 21, 2009
  Time: 4:14:16 PM
  To change this template use File | Settings | File Templates.
--%>


<%@ page import="grails.converters.JSON" contentType="text/html;charset=UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"
  "http://www.w3.org/TR/REC-html40/loose.dtd">
<html>
<head>

  <p:css name="macademiaJit"/>
  <g:include view="/layouts/headers.gsp"/>
  <p:css name="jqModal"/>

  <g:javascript>
    $().ready(function() {
        macademia.pageLoad();
    });
  </g:javascript>

</head>
<body>

<div id="mainContent">

  
  <div id="acknowledgements2">
    <div>generously supported by:</div>
    <div class="logo acm">
      <a href="http://acm.edu"><p:image src="acm_logo.png" alt="The Associated Colleges of the Midwest"/></a>
     </div>
    <div class="logo"><a href="http://mellon.org">The Andrew W.<br/>Mellon Foundation</a> </div>
    <div class="logo nsf">
      <a href="http://nsf.gov"><p:image src="NSF_Logo.png" alt="The National Science Foundation"/></a>
      </div>
    %{--<div class="logo"><span>The National Science Foundation</span></div>--}%
    %{--<div class="logo"><span>Macalester College</span></div>--}%
    %{--<div id="macLogo"><img src="${createLinkTo(dir: 'images', file: 'mac_crest.png')}"/>Macalester College</div>--}%
  </div>


  <div id="collegeFilterButton2" class="collegeFilterTrigger" >
  </div>
  <div id="slider">
    <div class="less"><a href="#">show less</a></div>
    <div class="mid">
      <div class="widget">&nbsp;</div>
      <div>
        <g:each in="${[1,2,3,4,5]}" var="i">
        <div class="tick">
          <a href="#">
            <p:image src="slider_tick.png"/>
          </a>
        </div>
        </g:each>
      </div>
    </div>
    <div class="more"><a href="#">show more</a></div>
  </div>
  

  <div id="infovis">

    
    &nbsp;
  </div>
  <g:render template="../templates/macademia/tagline"/>
</div>

  <g:render template="../templates/macademia/logo"/>
  <g:render template="../templates/macademia/glca_logo" />
<div id="extendedInfo">
  <g:render template="../layouts/rightNav"/>
</div>

  <g:javascript>
    $().ready(function() {
        macademia.serverLog('nav', 'initial', {'url' : location.href });  
    });
  </g:javascript>

<div id="aboutJqm" class="jqmWindow padded2 medium btxt">
  <a href="#" class="closeImg"><p:image src="close_icon.gif"/></a>
  <div class="logo">
    <p:image src="macademia-logo-black.png"/>
    <span class="tagline">Connecting colleagues who share research interests.</span>
  </div>
  <div class="topBorder instructions">Macademia visualizes faculty research interests.  You can:
        <ul class="styledList">
          <li>
            <b>Click</b> on a name or interest to recenter the visualization.
          </li>
          <li>
            <b>Hover</b> over a name or interest to show more information.
          </li>
          <li>
            <b>Search</b> in the upper right for a person or interest.
          </li>
          <li>
            <b>Filter</b> the search results by school.
          </li>
          <li>
            <b>Add</b> your own profile by signing up in the upper right.
          </li>
          <li>
            <b>Collaborate</b> by creating or viewing a collaboration request.
          </li>
        </ul>
    </div>
  %{--<div id="acknowledgements" class="topBorder">--}%
    %{--<div>Macademia is generously supported by:</div>--}%
    %{--<div class="acmLogo"><a href="http://acm.edu">The Associated Colleges of the Midwest &nbsp;<img src="${createLinkTo(dir: 'images', file: 'acm_logo.png')}"/></a></div>--}%
    %{--<div class="mellonLogo"><a href="http://mellon.org">The Andrew M. Mellon Foundation</a></div>--}%
    %{--<div id="macLogo"><img src="${createLinkTo(dir: 'images', file: 'mac_crest.png')}"/>Macalester College</div>--}%
  %{--</div>--}%
  <div id="team" class="topBorder">
    Macademia is developed by current and past students at Macalester College:&nbsp;
    Henry Charlton,
    Ryan Kerwin,
    Jeremy Lim,
    Brandon Maus,
    Nathaniel Miller,
    Meg Naminski,
    Ernesto Nunes,
    Alex Schneeman,
    Isaac Sparling,
    Anthony Tran,
    under the direction of Prof. Shilad Sen
  </div> 
  <div class="close">
    <a href="#"><div>Go to Macademia!</div></a>
  </div>
</div>
</body>
  <g:javascript >
      macademia.igMap = ${igMap as JSON};
      $().ready(function() {
          var params = {
              'page' : 'jit'
          };
          macademia.serverLog('page', 'load', params);

      });

    </g:javascript>
</html>
