Meteor.startup(function() {

    // polymer

    Session.set('polymerReady', false);

    window.addEventListener('polymer-ready', function(e) {
        Meteor.log.debug('polymer ready...')
        Session.set('polymerReady', true);
    });

    // map

    Session.set('mapfiltersVisible', 0);
    Session.set('mapReady', false);
    Mapbox.load('markercluster');
    
    Tracker.autorun(function() {
        if (!Mapbox.loaded()) {
            return;
        }

        Meteor.log.debug('mapbox loaded...');
        Session.set('mapReady', true);
        
        L.mapbox.accessToken = Meteor.settings.public.mapbox.apiToken;
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

