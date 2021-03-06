
var macademia = macademia || {};

macademia.density = {};

macademia.density.initDensity = function() {
    $("#density3").addClass('densityCur');    //put slider at the value
    var density = macademia.density.getValue();
    macademia.history.setTempValue('density', density);

    $('#densitySlider span').click(function() {
        $('.densityCur').addClass('density');
        $('.densityCur').removeClass('densityCur');
        $(this).removeClass('density');
        $(this).addClass('densityCur');


        var density = macademia.density.getValue();
        macademia.history.setTempValue('density', density);
        macademia.history.update();
    });

    $('#density #less a').click(function () {
        var val = macademia.density.getValue();
        if (val > 1) {
            $('#density'+(val - 1)).click();
        }
    });
    $('#density #more a').click(function () {
        var val = macademia.density.getValue();
        if (val < 5) {
            $('#density'+(val + 1)).click();
        }
    });
};

macademia.density.getValue = function() {
    return parseInt($('.densityCur').attr('id').charAt(7));
};
