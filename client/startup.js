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

    Template.registerHelper('transformListString', function(context) {
        var string = (context.hash) ? context.hash.string : context,
            delimiter = (context.hash) ? context.hash.delimiter : ',',
            append = (context.hash && context.hash.append ?
                context.hash.append : '');
        return _.map(string.split(delimiter), function(s) {
            return s.trim();
        }).join(append);
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
    if (_.isArray(value)) {
        value = value[0];
    }
    if (typeof selected === 'undefined') {
        selected = true;
    }
    return selected ? UI.labelColor(key, value) : Session.get('config').labelColors[key.toLowerCase()]['inactive'];
});
