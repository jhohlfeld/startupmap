var activeItem = new ReactiveVar(null),
    params = new ReactiveVar();

Tracker.autorun(function() {
    var controller = Router.current();

    if (!controller) {
        return;
    }
    params.set(controller.getParams());
});

Template.mapFilter.helpers({
    items: function() {
        var data = Startups.find({}, {
            fields: {
                'type': 1,
                'industry': 1
            }
        }).fetch();

        var p = params.get();

        var getCategoryItem = function(category) {
            var d = _.groupBy(data, category);
            return _.map(d, function(v, k) {
                var name = k.toLowerCase();
                var result = {
                    _id: category + '.' + name,
                    category: category,
                    title: k,
                    name: name,
                    count: v.length
                };

                if (p && p.category === category && p.value === name) {
                    activeItem.set(result);
                }

                return result;
            });
        };
        return {
            type: getCategoryItem('type'),
            industry: getCategoryItem('industry')
        }
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
    var data = Template.currentData();

    $(this.find('.item')).on('click', function(e) {
        e.preventDefault();
        var a = activeItem.get();
        if (a && a._id === data._id) {
            activeItem.set(null);
            Router.go('map');
        } else {
            activeItem.set(data);
            Router.go('map.filter', {
                category: data.category,
                value: data.name
            });
        }
    });
};
