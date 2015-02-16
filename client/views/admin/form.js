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

StartupEdit.prototype.setData = function(data) {
    var values = _.clone(data);
    if (_.isArray(values.industry)) {
        values.industry = values.industry.join(', ');
    }
    this.$el.form('set values', values);
    return this;
};

StartupEdit.prototype.getData = function() {
    var values = this.$el.form('get values');
    values.industry = values.industry.split(',');
    values.industry = _.map(values.industry, function(v) {
        return v.trim();
    });
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
    }
};

Forms.adminStartupEdit = StartupEdit;
