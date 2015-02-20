Session.set('map.filterActiveItems', []);

var filterItems = [];

Meteor.subscribe('startupsAll', function() {
    var data = Startups.find({
        'geolocation.coordinates': {
            '$exists': true
        }
    }, {
        fields: {
            'type': 1,
            'industry': 1
        }
    }).fetch();

    data.forEach(function(h) {
        h.industry.forEach(function(i) {
            var name = i.toLowerCase(),
                id = 'industry' + '.' + name,
                industry = _.find(filterItems, function(j) {
                    return j.id === id;
                });

            if (industry) {
                industry.count += 1;
            } else {
                industry = {
                    id: id,
                    category: 'industry',
                    title: i,
                    name: name,
                    count: 1,
                    selected: true
                };
                filterItems.push(industry);
            }

        });
    });

    filterItems = _.sortBy(filterItems, 'name');
    Session.set('map.filterActiveItems', filterItems);
});


Template.mapFilter.helpers({
    items: function() {
        return Session.get('map.filterActiveItems');
    },

    hideMapFilters: function() {
        return Session.get('hideMapFilters');
    }
});

Template.mapFilterItem.helpers({
    active: function() {
        var id = this.id,
            items = Session.get('map.filterActiveItems'),
            item = _.find(items, function(v) {
                return v.id === id;
            });
        return item.selected ? 'active' : '';
    }
});

Template.mapFilterItem.events({
    'click .label': function(e) {
        e.stopPropagation();
        var id = this.id,
            item = _.find(filterItems, function(v) {
                return v.id === id;
            });
        item.selected = !item.selected;
        Session.set('map.filterActiveItems', filterItems);
    }
});

Template.mapFilter.rendered = function() {
    var template = this;
    this.autorun(function() {
        template.$('.ui.accordion').accordion();
    });
}

Template.mapFilterItem.rendered = function() {};
