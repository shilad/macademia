$(document).ready(function() {
    console.log($('tr.person'));
    $('tr.person').on('click', function() {
        console.log("in here");

        var href = $(this).find("a").attr("href");
        if(href) {
            window.location = href;
        }
    });

});