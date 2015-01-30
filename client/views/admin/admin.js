var addDialog, removeDialog,
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
        return {
            list: Startups.find(),
            edit: this.editStartup.get(),
            remove: this.removeStartup.get()
        };
    },

    action: function() {
        this.render('admin');
    },

    onStop: function() {

        // clean up the modal mess

        $('.ui.modal').remove();
    },

    editStartup: new ReactiveVar(null),

    removeStartup: new ReactiveVar(null)

});

Template.admin.events({

    // new

    'click button#edit-startup': function() {
        Router.current().editStartup.set({});
    }
});

Template.startup.events({

    // edit

    'click .item[data-id]': function(e) {
        if ($(e.target).closest('button').length != 0) {
            return;
        }
        Router.current().editStartup.set(Startups.findOne({
            _id: this._id
        }));
    },

    // remove

    'click button.remove-startup': function(e) {
        Router.current().removeStartup.set(this);
    }
});

Template.admin.rendered = function() {
    Meteor.log.debug('rendered admin view..');
};

Template.editstartup.rendered = function() {
    var template = this;
    this.autorun(function() {

        Meteor.log.debug('(re)render editstartup view');

        var data = Template.currentData();

        if (!data) {
            return;
        }
        if (!Session.get('polymerReady')) {
            return;
        }

        if (!addDialog) {
            addDialog = $(template.firstNode);

            addDialog.modal({
                onApprove: function() {
                    return false;
                },
                onHidden: function() {
                    Router.current().editStartup.set(null);
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

                var doc = _.extend({}, Router.current().editStartup.get(),
                    addDialog.form('get values'));
                Meteor.call('saveStartup', doc)

                // saveStartup();
                addDialog.modal('hide');
            })

            var el = addDialog.find('input[name=location]');
            Meteor.typeahead(el, GeocoderGoogle.ttAdapter);
            el.on('typeahead:selected', function(event, suggestion, dataset) {
                collection.geolocation = suggestion.location;
            });
        }

        addDialog.form('clear').form('set values', data).modal('show');

    });
};

Template.removestartup.rendered = function() {
    var template = this;
    this.autorun(function() {

        Meteor.log.debug('(re)render removestartup view');

        var data = Template.currentData();

        if (!data) {
            return;
        }
        if (!Session.get('polymerReady')) {
            return;
        }

        if (!removeDialog) {
            removeDialog = $(template.firstNode);

            removeDialog.modal('setting', {
                onApprove: function() {
                    Meteor.call('removeStartup',
                        Router.current().removeStartup.get()._id);
                },

                onHidden: function() {
                    Router.current().removeStartup.set(null);
                }
            });
        }

        removeDialog.modal('show');
    });
};
