<%--
  Created by IntelliJ IDEA.
  User: henrycharlton
  Date: Jun 15, 2010
  Time: 4:33:59 PM
  To change this template use File | Settings | File Templates.
--%>

<div class="padded medium btxt" id="filterModal">
  <div id="consortiaFilter">
    <h3>Select Consortia:</h3>
      <form name="consortiaForm">
        <select id="consortia" name="consortia">
          <g:each in="${igList}" var="ig">
            <option class="consortium" id="consortium_${ig.id}" value="${ig.id}">${ig.name}</option>
          </g:each>
        </select>
      </form>
  </div>
  <div id="closeCollegeFilter">
    <a href ="#"><p:image src="close_icon.gif"/></a>
  </div>

    <div id="editColleges">
      <div id="collegeFilterEditButtons" class="padded2">
        <input id="addAllColleges" type="submit" value="Add all"/>
        <input id="clearAllColleges" type="submit" value="Remove all"/>

        <input id="collegeSearchAuto" type="text" prompt="Type college name" class="clearDefault"/>
        <input id="addCollege" type="submit" value="Add"/>
      </div>
      <div id="selectedColleges" class="medium">
          <ul>
            <g:each in="${institutions}" var="c">
              <div class="collegeDiv" id="c_${c.id}">
                <li class="college" institutionId="c_${c.id}">
                  <a href="#"><p:image src="close_icon.gif"/></a>
                  ${c.name}
                </li>
              </div>
            </g:each>
          </ul>
      </div>
      <div id="submitColleges">
          <input id ="selectColleges" type="submit" value = "Save schools and close"/>
      </div>
    </div>

    <g:javascript>
        macademia.initCollegeFilter();
    </g:javascript>
</div>
