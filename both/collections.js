Startups = new Meteor.Collection('startups');

if (Meteor.isServer) {

    Meteor.methods({
        saveStartup: function(doc) {
            check(doc, Match.ObjectIncluding({
                _id: Match.Optional(String),
                name: String,
                website: Match.Optional(String),
                location: Match.Optional(String),
                geolocation: Match.Optional({
                    'type': 'Point',
                    'coordinates': [Number]
                }),
                type: String,
                industry: [String],
                description: Match.Optional(String),
                dateFounded: Match.Optional(String),
                headcount: Match.Optional(String)
            }));
            Startups.upsert({
                _id: doc._id
            }, doc);
        },

        removeStartup: function(startupId) {
            check(startupId, String);
            Startups.remove({
                _id: startupId
            });
        }
    });

    Meteor.publish('startupsAll', function() {
        return Startups.find();
    });

    Meteor.publish('startup', function(startupId) {
        check(startupId, String);
        return Startups.find({
            '_id': startupId
        });
    });

    Meteor.publish('startupsFiltered', function(category, value) {
        check(category, String);
        check(value, String);
        return Startups.find(_.object([category], [{
            '$regex': '^' + value + '$',
            '$options': 'i'
        }]));
    });

    Meteor.publish('startupsByIndustry', function(industry) {
        check(industry, String);
        return Startups.find({
            'industry': {
                '$in': [industry]
            }
        });
    });

    // Accounts.createUser({
    //     username: 'admin',
    //     email: 'admin@example.com',
    //     password: 'admin'
    // });
}

if (Meteor.isClient) {

    // create subscription for map filter data

    Session.set('map.filterActiveItems', []);

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

        var filterItems = [];

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
                        selected: true,
                        active: false
                    };
                    filterItems.push(industry);
                }

            });
        });

        filterItems = _.sortBy(filterItems, 'name');
        Session.set('map.filterActiveItems', filterItems);
    });

}
