
var macademia = macademia || {};

macademia.density = {};

macademia.density.initDensity = function() {
    $('#densitySlider span').click(function() {
        $('.densityCur').addClass('density');
        $('.densityCur').removeClass('densityCur');
        $(this).removeClass('density');
        $(this).addClass('densityCur');
        var density = macademia.density.getValue();
        $.address.parameter('density', density);
        $.address.update();
    });
    var density = $.address.parameter('density') || 3;
    $('#density'+density).click();
    
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
