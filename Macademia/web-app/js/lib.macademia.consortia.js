/**
 * Javascript for the consortiaEdit page
 */
macademia = macademia || {};


    $(document).ready(function(){


        $("#hide").click(function(){
            $("#hideblurb").hide();
            $("#showeditblurb").show();
        });

        $("#saveblurb").click(function(){
            $("#hideblurb").show();
            $("#showeditblurb").hide();
        });

        $("#hideNm").click(function(){
            $("#hidename").hide();
            $("#showeditname").show();
        });

        $("#hidelogo").click(function(){
            $("#hideimg").hide();
            $("#showavatar").show();
        });


    });




