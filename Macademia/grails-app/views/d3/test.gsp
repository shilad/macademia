<%--
  Created by IntelliJ IDEA.
  User: zixiao
  Date: 8/1/13
  Time: 1:45 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>

<!DOCTYPE html>
<html >
  <head>
     <script type="text/javascript" src="http://mbostock.github.com/d3/d3.js"></script>
  </head>
  <body>
  <div class="example_div"></div>
    <script type="text/javascript">
var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.text("a simple tooltip");

var sampleSVG = d3.select(".example_div")
	.append("svg:svg")
	.attr("class", "sample")
	.attr("width", 300)
	.attr("height", 300);

d3.select(".example_div svg")
	.append("svg:circle")
	.attr("stroke", "black")
	.attr("fill", "aliceblue")
	.attr("r", 50)
	.attr("cx", 52)
	.attr("cy", 52)
	.on("mouseover", function(){return tooltip.style("visibility", "visible");})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    </script>
  </body>
</html>
