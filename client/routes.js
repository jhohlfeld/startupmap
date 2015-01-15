Router.configure({
    layoutTemplate: 'mapLayout',
    loadingTemplate: 'loading'
});

Router.route('map', {
    path: '/'
});

Router.route('/admin', {
    name: 'admin',
});

Router.route('/admin/edit-startup', {
    name: 'admin.add',
    controller: 'AdminController'
});

Router.route('/admin/edit-startup/:_id', {
    name: 'admin.edit',
    controller: 'AdminController'
});

Session.set('mapId', 'jhohlfeld.klaa8f80');
Session.set('mapAccessToken', 'pk.eyJ1IjoiamhvaGxmZWxkIiwiYSI6IjRVTFJXY0EifQ.K8QEmAJhBKxRt3eJ7fA8eA');

Meteor.startup(function() {

    Meteor.polymerReady = new ReactiveVar(false);

    window.addEventListener('polymer-ready', function(e) {
        console.log('polymer ready...')
        Meteor.polymerReady.set(true);
    });

    Mapbox.load();

    Deps.autorun(function() {
        if (Mapbox.loaded()) {
            console.log('mapbox loaded');
            L.mapbox.accessToken = Session.get('mapAccessToken');
            Geocoder.setGeocoder(L.mapbox.geocoder('mapbox.places'));
            // Session.set('geocoder', new Geocoder(L.mapbox.geocoder(Session.get('mapId'))));
        }
    });


});
