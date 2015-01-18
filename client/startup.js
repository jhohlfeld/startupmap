Session.set('mapId', 'jhohlfeld.klaa8f80');
Session.set('mapAccessToken', 'pk.eyJ1IjoiamhvaGxmZWxkIiwiYSI6IjRVTFJXY0EifQ.K8QEmAJhBKxRt3eJ7fA8eA');
Session.set('mapfiltersVisible', 0);

Meteor.startup(function() {

    Session.set('polymerReady', false);
    Session.set('mapboxReady', false);

    window.addEventListener('polymer-ready', function(e) {
        console.log('polymer ready...')
        Session.set('polymerReady', true);
    });

    Mapbox.load('markercluster');

    Tracker.autorun(function() {
        if (!Mapbox.loaded()) {
            return;
        }

        console.log('mapbox loaded...');
        Session.set('mapboxReady', true);
        
        L.mapbox.accessToken = Session.get('mapAccessToken');
        Geocoder.setGeocoder(L.mapbox.geocoder('mapbox.places'));

    });
});

UI.labelColor = function(key, value) {
    var config = Session.get('config'),
        color = config.labelColors[key.toLowerCase()][value.toLowerCase()];
    return color;
}

UI.labelColorHash = function(key, value) {
    var config = Session.get('config');
    return config.colors[UI.labelColor(key.toLowerCase(), value.toLowerCase())];
}


UI.labelIcon = function(key, value) {
    var config = Session.get('config'),
        icon = config.labelIcons[key.toLowerCase()][value.toLowerCase()];
    return icon;
}

UI.registerHelper('labelColor', function(context) {
    var key = context.hash.key,
        value = context.hash.value;
    return UI.labelColor(key, value);
});
