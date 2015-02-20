Meteor.startup(function() {

    // i18n


    // polymer

    Session.set('polymerReady', false);

    window.addEventListener('polymer-ready', function(e) {
        Meteor.log.debug('polymer ready...')
        Session.set('polymerReady', true);
    });

    // map

    Session.set('mapfiltersVisible', 0);

    // accounts

    Session.set('loginDisabled', false);

    Template.registerHelper('userId', function() {
        return Meteor.userId();
    });

    Template.registerHelper('concatList', function(context) {
        return context.join(', ');
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
        value = context.hash.value,
        selected = context.hash.selected;
    if (typeof selected === 'undefined') {
        selected = true;
    }
    return selected ? UI.labelColor(key, value) : Session.get('config').labelColors[key.toLowerCase()]['inactive'];
});
