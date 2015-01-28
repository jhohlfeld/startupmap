FormRules = {};

FormRules.adminStartupEdit = {
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
