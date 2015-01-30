var addDialog, removeDialogView,
    formValid = new ReactiveVar(false);

AdminController = RouteController.extend({
    template: 'admin',
    layoutTemplate: 'adminLayout',

    onBeforeAction: function() {
        if (Meteor.loggingIn()) {
            this.render('loading');
        } else if (Meteor.user()) {
            this.next();
        } else {
            this.redirect('accounts.login');
        }
    },

    waitOn: function() {
        return [
            Meteor.subscribe('startupsAll')
        ];
    },

    data: function() {
        return Startups.find();
    },

    action: function() {
        this.render('admin');
    },

    onStop: function() {
        if (addDialog) {
            addDialog.remove();
        }
    }

});

var collection = {};

var saveStartup = function(cp) {
    _.extend(collection, getValues());
    Meteor.call('saveStartup', collection);
};

var setValues = function(doc) {
    addDialog.form('clear');
    addDialog.form('set values', doc);
};

var getValues = function() {
    return addDialog.form('get values');
};

Template.admin.events({

    // new

    'click button#edit-startup': function() {
        addDialog.form('clear');
        $('.modal').modal('show');
    }
});

Template.startup.events({

    // edit

    'click .item[data-id]': function(e) {
        if ($(e.target).closest('button').length != 0) {
            return;
        }
        collection = Startups.findOne({
            _id: this._id
        });
        setValues(collection);
        $('.modal').modal('show');
    },

    // remove

    'click button.remove-startup': function(e) {
        Router.current().removeStartup(this._id, function(err, doc) {});
    }
});

Template.admin.rendered = function() {
    Meteor.log.debug('rendered admin view..');
};

Template.editstartup.rendered = function() {
    Meteor.log.debug('rendered admin edit view..');

    var template = this;

    this.autorun(function() {
        if (!Session.get('polymerReady')) {
            return;
        }

        addDialog = $(template.firstNode);

        addDialog.modal({
            onApprove: function() {
                return false;
            }
        });

        addDialog.form(FormRules.adminStartupEdit, {
            inline: true,
            on: 'submit',
            onSuccess: function() {
                formValid.set(true);
            },
            onFailure: function() {
                formValid.set(false);
            }
        });
        addDialog.find('select.dropdown').dropdown();

        addDialog.on('submit', function(e) {
            e.preventDefault();

            if (!formValid.get()) {
                return;
            }

            saveStartup();
            addDialog.modal('hide');
        })

        var el = addDialog.find('input[name=location]');
        Meteor.typeahead(el, GeocoderGoogle.ttAdapter);
        el.on('typeahead:selected', function(event, suggestion, dataset) {
            collection.geolocation = suggestion.location;
        });

    });
};

Template.removeconfirm.rendered = function() {
    var template = this;
    this.autorun(function() {
        var data = Template.currentData();

        if (!Session.get('polymerReady')) {
            return;
        }

        template.$('.modal').modal('show').modal('setting', {
            onApprove: function() {
                Meteor.call('removeStartup', data._id);
            },

            onHidden: function() {
                Blaze.remove(removeDialogView);
            }
        });
    });
};
