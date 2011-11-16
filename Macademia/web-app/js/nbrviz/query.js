/**
 * Construct a new query-based visualization.
 * @param params - An object with the following keys and values:
 * people: A list of
 */
var QueryViz = NbrViz.extend({
    onAddressChange : function(event) {
        if (!event.parameters.queryIds) {
            this.refreshViz([]);
            return;
        }
        var self = this;
        var queryIds = event.parameters.queryIds.split('_');
        $.each(queryIds, function(i, qid) { self.initSlider(qid); });
        this.refreshViz(queryIds);
    },

    refreshViz : function(queryIds) {
        macademia.nbrviz.colors.assign(queryIds);
        this.initKey();
        if (!queryIds.length) {
            this.loadJson(new Model({}));
            return;
        }

        // TODO: make asynchronous
        var url = macademia.makeActionUrlWithGroup('all', 'query', 'data');
        var weights = [];
        var self = this;
        $.each(queryIds, function(i, qid) {
                weights.push(self.interestWeights[qid] || 3);
            });
        url += '?queryIds=' + queryIds.join('_');
        url += '&queryWeights=' + weights.join('_');
        this.setState(this.STATE_LOADING);
        this.showLoadingMessage();
        $.ajax({
            url: url,
            dataType : 'json',
            success : function (json) { self.loadJson(new VizModel(json)); }
        });
    },

    getQueryIds : function() {
        var s = $.address.parameter('queryIds');
        if (s) {
            return $.address.parameter('queryIds').split('_');
        } else {
            return [];
        }
    },

    addInterestToQuery : function(id, name) {
        if (name == null) {
            name = this.getOrLookupInterestName(id);
        }
        this.setLoadingMessage('adding "' + name + '"...');
        var ids = this.getQueryIds();
        if ($.inArray(''+id, ids) < 0) {
            ids.push(id);
            $.address.parameter('queryIds', ids.join('_'));
        } else {
            return true;
        }
    },
    interestClicked : function(interestNode) {
        this.addInterestToQuery(interestNode.id, interestNode.name);
    },
    removeInterestFromQuery : function(id) {
        var name = this.getOrLookupInterestName(id);
        this.setLoadingMessage('removing "' + name + '"...');
        var ids = this.getQueryIds();
        var i = $.inArray(''+id, ids);
        ids.splice(i, 1);
        $.address.parameter('queryIds', ids.join('_'));
    },

    initKey : function() {
        $(".addedInterestDiv").each(
            function() { if (this.id != 'queryInterestTemplate') { $(this).remove(); } }
        );
        // create labels
        var self = this;
        $.each(this.getQueryIds(), function(i, qid) {
            var name = self.getOrLookupInterestName(qid);
            var elem = $("#queryInterestTemplate").clone();
            elem.attr('id', 'queryInterestKey' + qid);
            var html = elem.html();
            html = html.replace(/INTEREST_ID/g, ""+qid);
            html = html.replace(/INTEREST_NAME/g, ""+name.toLowerCase());
            elem.html(html);
            $("#queryInterestTemplate").before(elem);
            elem.find('.interestSlider').slider(
                    {
                        min : 1, max : 5,
                        value : self.interestWeights[qid] || 3,
                        change : function() {$.address.update();}
                    }
            );
            elem.find('a.removeInterest').click(function() {
                self.removeInterestFromQuery(qid);
                return false;
            });
        });

        // draw spheres
        $.each(this.getQueryIds(), function(i, qid) {
            var sphereElem =  $(".interestKey[interest='" + qid + "']");
            self.drawKeySphere(sphereElem, qid);
        });
    }
});