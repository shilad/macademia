
var ExploreViz = NbrViz.extend({
    init : function(params) {
        params.peopleClickable = true;
        this._super(params);
    },
    onAddressChange : function(event) {
        var c = event.parameters.rootId.charAt(0);
        var rootClass = c == 'p' ? 'person' : 'interest';
        var rootId = event.parameters.rootId.substring(1);
        this.refreshViz(rootClass, rootId);
    },
    recenter : function(rootClass, rootId, name) {
        name = name || ('unknown ' + rootClass);
        this.setLoadingMessage('re-centering around "' + name + '"...');
        $.address.autoUpdate(false);
        $.address.parameter('rootId2', $.address.parameter('rootId1'));
        $.address.parameter('rootId1', $.address.parameter('rootId'));
        $.address.parameter('rootId', rootClass.charAt(0) + rootId);
        $.address.autoUpdate(true);
        $.address.update();
    },
    refreshViz : function(rootClass, rootId){
        if (rootClass != 'person' && rootClass != 'interest') {
            alert('unknown klass: "' + rootClass + '" (must be person or interest).');
            return;
        }

        // TODO: make asynchronous
        var url = macademia.makeActionUrlWithGroup('all', 'explore', rootClass + 'Data') + '/' + rootId;

        var parentIds = [];
        var parentWeights = [];

        $.each(this.interestWeights, function (k, v) {
            parentIds.push(k);
            parentWeights.push(v);
        });
        if (parentIds.length) {
            url += '?parentIds=' + parentIds.join('_');
            url += '&parentWeights=' + parentWeights.join('_');
        }

        var self = this;
        $.ajax({
            url: url,
            dataType : 'json',
            success : function (json) { self.loadJson(new VizModel(json)); }
        });
        this.showLoadingMessage();
    },

    loadJson : function(model) {
        this.initKey(model);
        this._super(model);
    },

    initKey : function(model) {
        macademia.nbrviz.assignColors(model.getClusterIds());
        $(".addedInterestDiv").each(
                function() { if (this.id != 'queryInterestTemplate') { $(this).remove(); } }
        );
        var self = this;
        $.each(model.getClusterIds(), function(i, pid) {

            var name = self.getOrLookupInterestName(pid);
            var elem = $("#queryInterestTemplate").clone();
            elem.attr('id', 'queryInterestKey' + pid);
            var html = elem.html();
            html = html.replace(/INTEREST_ID/g, ""+pid);
            html = html.replace(/INTEREST_NAME/g, ""+name.toLowerCase());
            elem.html(html);
            $("#queryInterestTemplate").before(elem);
            elem.find('.interestSlider').slider(
                    {
                        min : 1, max : 5,
                        value : self.interestWeights[pid] || 3,
                        change : function(event, ui) {
                            self.interestWeights[pid] = ui.value;
                            $.address.update();
                        }
                    }
            );
            self.drawKeySphere(pid);
        });
        $("#currentInterests h1 span").html(model.getRootName());
    },
    interestClicked : function(interestNode) {
        this.recenter('interest', interestNode.id, interestNode.name);
    },
    personClicked : function(personNode) {
        this.recenter('person', personNode.id, personNode.name);
    },
    layoutInterests : function(json) {
        this._super(json);
        this.drawHistory();
    },
    drawHistory : function() {
        var points = [
                [-0.89, 0.93],
                [-0.60, 1.00]
        ];
        for (var i = 0; i < points.length; i++) {
            var p = new Point(new Vector(
                    this.xRange * points[i][0],
                    this.yRange * points[i][1]));
            points[i] = [p.screenX(), p.screenY()];
        }
        if ($.address.parameter('rootId1')) {

        }
        var interest = $.map(this.interests, function (i) { return i; })[0];
        for (var i = 0; i < points.length; i++) {
            var x = points[i][0];
            var y = points[i][1];
            var is = new InterestSphere({
                x: x,
                y: y,
                r: 10 + 5 * (points.length - i - 1),
                hue: 0.5,
                sat : 0.2,
                brightness : 0.8,
                strokeWidth : 1,
                name: 'social computing',
                interest : interest,
                paper: this.paper,
                hoverDelay : 50,
                font : macademia.nbrviz.subFont,
                boldFont : macademia.nbrviz.subFontBold,
                xOffset : 0,
                yOffset : 15,
                clickText : 'foo and bar'
            });
            is.toFront();
        }

        // TODO: make this work for foo.
        var z = macademia.nbrviz.magnet.ZOOM_CONSTANT;
        var xr = macademia.nbrviz.magnet.X_RANGE;
        var yr = macademia.nbrviz.magnet.Y_RANGE;
        var p0 = new Point(new Vector(-this.xRange, 0));
        var pathStr = 'M' + p0.screenX() + ' ' + p0.screenY();

        pathStr += 'C' + (p0.screenX() - xr * z * .1) + ' ' + (p0.screenY() + yr * z * .3);
        pathStr += ' ' + (points[0][0] - xr * z * .2) + ' ' + (points[0][1] - yr * z * .2);
        pathStr += ' ' + points[0][0] + ' ' + points[0][1];
//

        pathStr += 'C' + (points[0][0] + xr * z * .1) + ' ' + (points[0][1] + yr * z * .1);
        pathStr += ' ' + (points[1][0] - xr * z * .1) + ' ' + (points[1][1] + yr * z * 0.05);
        pathStr += ' ' + points[1][0] + ' ' + points[1][1];
        var p = this.paper.path(pathStr);
        p.attr({ stroke : '#999', 'stroke-dasharray' : '.'  });
        p.insertAfter(this.bg);
    }
});