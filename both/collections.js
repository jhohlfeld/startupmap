Startups = new Mongo.Collection('startups');

if (Meteor.isServer) {

    Meteor.methods({
        addStartup: function(doc) {
            if (!doc.name) {
                throw new Meteor.Error('missing-name', 'A startup at least needs a name!');
            }
            if (!doc.type) {
                throw new Meteor.Error('missing-type', 'Please give a type!');
            }
            if (!doc.industry) {
                throw new Meteor.Error('missing-industry', 'Please give an industry!');
            }
            Startups.insert(doc);
        }
    });

    Meteor.publish("startups", function() {
        return Startups.find();
    });

}

if (Meteor.isClient) {

    Meteor.subscribe('startups');

}
