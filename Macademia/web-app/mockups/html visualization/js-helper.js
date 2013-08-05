/**
 * This code accommodates up to 4 "more" tooltips--tooltips that come when you hover over "And 12 more..."
 * optons for interests.
 */

$(document).ready(function(){
    new DropDown($("#dd"));

    $('#more1').on('mouseover',function(){
        $('#more1Tooltip').show();
        $(document).mousemove(function(e){
            $('#more1Tooltip').css('top', e.pageY).css('left', e.pageX+10)
                .on('mouseover',function(){
                    $('#more1Tooltip').show();
                })
                .on('mouseout', function(){
                    $('#more1Tooltip').hide();
                });

        });
    })
        .on('mouseout',function(){
            $('#more4Tooltip').hide();
        });

    $('#more2').on('mouseover',function(){
        $('#more2Tooltip').show();
        $(document).mousemove(function(e){
            $('#more2Tooltip').css('top', e.pageY).css('left', e.pageX+10)
                .on('mouseover',function(){
                    $('#more2Tooltip').show();
                })
                .on('mouseout', function(){
                    $('#more2Tooltip').hide();
                });

        });
    })
        .on('mouseout',function(){
            $('#more4Tooltip').hide();
        });

    $('#more3').on('mouseover',function(){
        $('#more3Tooltip').show();
        $(document).mousemove(function(e){
            $('#more3Tooltip').css('top', e.pageY).css('left', e.pageX+10)
                .on('mouseover',function(){
                    $('#more3Tooltip').show();
                })
                .on('mouseout', function(){
                    $('#more3Tooltip').hide();
                });

        });
    })
        .on('mouseout',function(){
            $('#more4Tooltip').hide();
        });

    $('#more4').on('mouseover',function(){
        $('#more4Tooltip').show();
        $(document).mousemove(function(e){
            $('#more4Tooltip').css('top', e.pageY).css('left', e.pageX+10)
                .on('mouseover',function(){
                    $('#more4Tooltip').show();
                })
                .on('mouseout', function(){
                    $('#more4Tooltip').hide();
                });

        });
    })
        .on('mouseout',function(){
            $('#more4Tooltip').hide();
        });

    $('tr.people').on('click', function() {
        console.log("in here");

        var href = $(this).find("a").attr("href");
        if(href) {
            window.location = href;
        }
    });

});