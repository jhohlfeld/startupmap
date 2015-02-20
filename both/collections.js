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

if (Meteor.isClient) {}
