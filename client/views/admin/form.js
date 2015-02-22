Forms = {};

var StartupEdit = function(el, options) {
    this.$el = $(el);
    this.$el.form(StartupEdit.rules, options)

    var inp = this.$el.find('input[name=location]');
    Meteor.typeahead(inp, GeocoderGoogle.ttAdapter);
    inp.on('typeahead:selected', function(event, suggestion, dataset) {
        var col = Router.current().editStartup.get();
        col.geolocation = suggestion.location;
    });

    this.$el.find('select.dropdown').dropdown();
};

/**
 * Set the form's fields from a data document.
 *
 * @method setDat
 */
StartupEdit.prototype.setData = function(data) {
    var values = _.clone(data);
    if (_.isArray(values.industry)) {
        values.industry = values.industry.join(', ');
    }

    // hanlde dates
    var m = moment.utc(values.dateFounded);
    values.dateFounded = m.isValid() ? m.format('L') : '';

    this.$el.form('set values', values);
    return this;
};

/**
 * Retrieve data document from fields in the form.
 *
 * @method getData
 */
StartupEdit.prototype.getData = function() {
    var values = this.$el.form('get values');

    // split industry into array
    values.industry = values.industry.split(',');
    values.industry = _.map(values.industry, function(v) {
        return v.trim();
    });

    // create slug from name
    values.slug = URLify2(values.name, 30);

    // prefix urls to always contain a protocol
    _.each(_.pick(values,
        'website',
        'video',
        'socialFacebook',
        'socialGplus',
        'socialTwitter'), function(v, k) {
        v = v.trim();
        if (v && !v.match(/^\w+:\/\//)) {
            v = 'https://' + v;
        }
        values[k] = v;
    });

    // parse date value
    var m;
    if (values.dateFounded !== '') {
        if (values.dateFounded.length > 4) {
            m = moment.utc(values.dateFounded, 'L', moment().locale());
        } else {
            m = moment.utc(values.dateFounded, 'YYYY', moment().locale());
        }
    }
    if (m && m.isValid()) {
        values.dateFounded = m.toDate();
    } else {
        values.dateFounded = null;
    }

    return values;
};

StartupEdit.prototype.clear = function() {
    this.$el.form('clear');
    return this;
};

StartupEdit.rules = {
    name: {
        identifier: 'name',
        rules: [{
            type: 'empty',
            prompt: TAPi18n.__('admin.startup.validation.name')
        }]
    },
    location: {
        identifier: 'location',
        rules: [{
            type: 'empty',
            prompt: TAPi18n.__('admin.startup.validation.location')
        }]
    },
    type: {
        identifier: 'type',
        rules: [{
            type: 'empty',
            prompt: TAPi18n.__('admin.startup.validation.type')
        }]
    },
    industry: {
        identifier: 'industry',
        rules: [{
            type: 'empty',
            prompt: TAPi18n.__('admin.startup.validation.industry')
        }]
    },
    headcount: {
        identifier: 'headcount',
        rules: [{
            type: 'integer',
            prompt: TAPi18n.__('admin.startup.validation.integer')
        }]
    }
};

Forms.adminStartupEdit = StartupEdit;
