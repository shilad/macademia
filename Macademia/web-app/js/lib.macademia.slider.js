/**
 * Provides the Autocomplete widget for macademia.
 */



var macademia = macademia || {};

/**
 * Example of usage for the search box
 */
macademia.slider = {};

macademia.slider.initSlider = function() {
    var density = $.address.parameter('density') || 3;
    $('#slider .widget').slider({
			value: density,
			min: 1,
			max: 5,
			slide: function(event, ui) {
			},
            start: function(event, ui) {
                // all actions here upon slide starting.
			},
            change: function(event, ui) {
                $.address.parameter('density', ui.value);
                $.address.update();
			},
            stop: function(event, ui) {
                // all actions here happen when user stops sliding
			}
	});
    var i = 1;
    $('#slider .tick a').each(function () {
        var x = i;
        $(this).click(function() {
            macademia.slider.changeValue(x);
            return false;
        });
        i += 1;
    });
    $('#slider .less a').click(function () {
        var val = macademia.slider.getValue();
        macademia.slider.changeValue(Math.max(1, val - 1));
    });
    $('#slider .more a').click(function () {
        var val = macademia.slider.getValue();
        macademia.slider.changeValue(Math.min(5, val + 1));
    });
};

macademia.slider.changeValue = function(value) {
    $('#slider .widget').slider('value', value);
};

macademia.slider.getValue = function() {
    return $('#slider .widget').slider('value');
};
