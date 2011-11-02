
var ExploreViz = NbrViz.extend({
    init : function(params) {
        params.peopleClickable = true;
        this._super(params);
    },
    onAddressChange : function(event) {
        var interestId = event.parameters.interestId;
        var personId = event.parameters.personId;
        var rootClass = interestId ? 'interest' : 'person';
        var rootId = interestId || personId;
        this.refreshViz(rootClass, rootId);
    },
    recenter : function(rootClass, rootId, name) {
        name = name || ('unknown ' + rootClass);
        this.setLoadingMessage('re-centering around "' + name + '"...');
        $.address.autoUpdate(false);
        $.address.parameter('interestId', null);
        $.address.parameter('personId', null);
        $.address.parameter(rootClass + 'Id', rootId);
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
                        change : function() {$.address.update();}
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
    }
});