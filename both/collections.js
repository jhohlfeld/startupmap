Startups = new Mongo.Collection('startups');

if (Meteor.isServer) {

    Meteor.methods({
        saveStartup: function(doc) {
            check(doc, {
                _id: Match.Optional(String),
                name: String,
                website: Match.Optional(String),
                location: Match.Optional(String),
                geolocation: Match.Optional({
                    'type': 'Point',
                    'coordinates': [Number]
                }),
                type: String,
                industry: String,
                description: Match.Optional(String),
                founded: Match.Optional(String),
                headcount: Match.Optional(String)
            });
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

    Meteor.publish("startups", function() {
        return Startups.find();
    });

    Meteor.publish("startup", function(startupId) {
        check(startupId, String);
        return Startups.find({
            '_id': startupId
        });
    });

}

if (Meteor.isClient) {

    Meteor.subscribe('startups');
    // Meteor.subscribe('startup');

}
