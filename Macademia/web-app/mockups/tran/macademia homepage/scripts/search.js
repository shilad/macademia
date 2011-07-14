		$(document).ready(function(){

			$(".delete").click(function(event){
				$(this).parents("li").animate({opacity: "hide" }, "normal")
			});
			$("#editColleges").hide();
			$("#selectButton").click(function(event) {
				$("#editColleges").slideToggle();
				$("#selectButton").toggle();
			});
			$("#close > a").click(function(event) {
				$("#editColleges").slideToggle();
				$("#selectButton").slideToggle();
			});
			$("#clear").click(function(event) {
				$("#selectedColleges > ul > li").hide();
			});
			$("#add").click(function(event) {
				$("#selectedColleges > ul > li").show();
			});
			$("#show").hide();
			$("#hide").click(function(event) {
				$("#sidebar > *").toggle()
				$("#sidebar").animate({width: "0"}, "slow")
				$("#visual").animate({right: "0"}, "slow")
				$("#show").show();
			});
			$("#show").click(function(event) {
				$("#sidebar").animate({width: "320"}, "slow");
				$("#visual").animate({right: "320"}, "slow", function() {$("#sidebar > *").toggle();$("#show").hide()});
			});
		});