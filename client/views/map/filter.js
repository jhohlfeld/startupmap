var activeItem = new ReactiveVar(null);

Template.mapFilter.helpers({
    items: function() {
        var data = Startups.find({}, {
            fields: {
                'type': 1,
                'industry': 1
            }
        }).fetch();

        var getCategoryItem = function(category) {
            var d = _.groupBy(data, category);
            return _.map(d, function(v, k) {
                var name = k.toLowerCase();
                return {
                    _id: category + '.' + name,
                    title: k,
                    name: name,
                    count: v.length
                };
            });
        };
        return {
            type: getCategoryItem('type'),
            industry: getCategoryItem('industry')
        };
    },

    hideMapFilters: function() {
        return Session.get('hideMapFilters');
    }
});

Template.mapFilterItem.helpers({
    active: function() {
        return activeItem.get() === this ? 'active' : '';
    },
    disabled: function() {
        var active = activeItem.get();
        return active && active !== this ? 'disabled' : '';
    },
});

Template.mapFilterItem.rendered = function() {
    var template = this;
    this.autorun(function() {

        if (!Session.get('polymerReady')) {
            return;
        }

        var data = Template.currentData();

        template.$('.item').on('click', function() {
            if (activeItem.get() === data) {
                activeItem.set(null);
            } else {
                activeItem.set(data);
            }
        });
    });
};
