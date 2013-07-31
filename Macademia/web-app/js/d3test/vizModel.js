var VizModel = Class.extend({
    init : function(json) {
        this.json = json;
    },
    getClusterIds : function() {
        var ids = $.map(this.json.clusterMap, function (v, k) { return k; });

        // make sure root id is first if this is an interest-centric graph
        if (this.getRootClass() == 'interest') {
            var i = ids.indexOf(this.getRootId());
            if (i < 0) {
                alert('initKey: couldnt find ' + this.getRootId() + ' in parentIds ' + ids);
                return;
            }
            ids.splice(i, 1);
            ids.unshift(this.getRootId());
        }

        return ids;
    },
    getPeople : function() {
        return this.json.people;
    },
    getPeopleIds : function() {
        return $.map(this.json.people, function (v, k) { return k; });
    },
    getClusterMap : function() {
        return this.json.clusterMap;
    },
    getRootName : function() {
        var plural = this.getRootClass() == 'interest' ? 'interests' : 'people';
        return this.json[plural][this.getRootId()]['name'];
    },
    getInterests : function() {
        // build up nested map of clusters if necessary
        if (typeof(this.interests) === 'undefined') {
            this.interests = {};
            var self = this;
            $.each(this.json.interests, function (id, info) {
//                var hasCluster = (info && info.cluster >= 0);
                self.interests[id] = {
                    id:id,
                    name:info.name,
                    relevance : info.relevance,
//                    relatedQueryId : hasCluster ? info.cluster : -1,
                    cluster:info.cluster,
                    isInClusterMap: info.roles.length > 0 ? true : false,
                    roles:info.roles
                };
            });
        }
        return this.interests;
    },
    getInterest : function(id) {
        return this.getInterests()[id];
    },
    getPerson : function(pid) {
        return this.json.people[pid];
    },
    hasParentInterest : function(pid) {
        return (''+pid in this.json.clusterMap);
    },
    hasPerson : function(pid) {
        return (''+pid in this.json.people);
    },
    getNormalizedPersonRelevance : function(pid) {
        // calculate min / max relevance if necessary
        if (typeof(this.maxPersonRelevance) === 'undefined') {
            var maxRel = -1;
            var minRel = 10000000000000000000000;
            $.each(this.json.people, function(id, pinfo) {
                maxRel = Math.max(pinfo.relevance.overall, maxRel);
                minRel = Math.min(pinfo.relevance.overall, minRel);
            });
            this.maxPersonRelevance = maxRel;
            this.minPersonRelevance = minRel;
        }
        var pinfo = this.json.people[pid];
        return ((pinfo.relevance.overall - this.maxPersonRelevance)
                / (this.minPersonRelevance - this.maxPersonRelevance));
    },
    getRelatedInterests : function(id) {
        var self = this;
        return $.map(
                this.getClusterMap()[id],
                function(ri) {return self.getInterest(ri);}
            );
    },
    getPersonInterests : function(pid) {
        var self = this;
        return $.map(
                this.json.people[pid].interests,
                function(i) { return self.getInterest(i); }
        );
    },
    getPersonInterestGroups : function(pid, interestClusters) {
        var pinfo = this.json.people[pid];
        var totalRelevance = 0.0;
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall') {totalRelevance += weight;}
        });
        var totalCount = 0.0;
        $.each(pinfo.count, function(id, n) {
            if (id != 'overall' && id != '-1') {totalCount += n;}
        });
        var interestGroups = [];
        $.each(pinfo.relevance, function(id, weight) {
            if (id != 'overall' && weight > 0) {
                interestGroups.push([
                    interestClusters[id],
                    pinfo.relevance[id],
                    pinfo.count[id] / totalCount
                ]);
            }
        });
        return interestGroups;
    },
    getRootId : function() { return ''+this.json.rootId; },
    getRootClass : function() { return this.json.rootClass; },
    isEmpty : function() {
        return !this.json || !this.json.interests || !macademia.objectSize(this.json.interests);
    },
    dump : function() {
        console.log('people are:');
        for (var pid in this.json.people) {
            var p = this.json.people[pid];
            console.log('\t' + p.id + ': ' + p.name);
        }
        console.log('interests are:');
        for (var iid in this.json.clusterMap) {
            var i = this.json.interests[iid];
            console.log('\t' + i.id + ': ' + i.name);
        }
    }
});