		$(document).ready(function(){

			$("div#changePw input").click(function(event){
				$("div#passwordWrapper").css({"visibility":"visible"})
			});
			$("div#submitPassword input").click(function(event){
				$("div#passwordWrapper").css({"visibility":"collapse"})
			});
			$("[value$='Remove']").click(function(event){
				$(this).parent().remove();
			});
		});