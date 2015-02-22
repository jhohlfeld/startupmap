var activeItems = new ReactiveDict(),
    activeItem = null;

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
    },
    resultItems: function() {
        return [];
    }
});

Template.mapFilterResult.helpers({
    resultItems: function() {
        return Startups.find({
            'industry': {
                '$in': [this.title]
            },
            'geolocation.coordinates': {
                '$exists': true
            }
        });
    }
});

// startup items in accordeon content

Template.mapFilterResult.events({
    'click .list': function() {
        var filterItems = Session.get('map.filterActiveItems'),
            id = this.id,
            item = _.find(filterItems, function(v) {
                return v.id === id;
            });
        if (!item.selected) {
            item.selected = true;
            Session.set('map.filterActiveItems', filterItems);
        }
    },

    'click a': function() {
        Router.go('map.info', {
            slug: this.slug
        });
    }
});

// accordion items behavior

Template.mapFilterItem.events({
    'click .label': function(e) {
        e.stopPropagation();
        var filterItems = Session.get('map.filterActiveItems'),
            id = this.id,
            item = _.find(filterItems, function(v) {
                return v.id === id;
            });
        item.selected = !item.selected;
        Session.set('map.filterActiveItems', filterItems);
    },

    'click .title': function() {
        if (activeItem) {
            activeItems.set(activeItem, false);
        }
        if (activeItem === this.id) {
            return;
        }
        activeItems.set(this.id, true);
        activeItem = this.id;
    }
});

Template.mapFilter.rendered = function() {
    var template = this;
    this.autorun(function() {
        template.$('.ui.accordion').accordion();
    });
}

Template.mapFilterItem.rendered = function() {};
