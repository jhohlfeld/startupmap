var modal, nextRoute = 'map';

AccountsController = RouteController.extend({

    layoutTemplate: 'mapLayout',
    template: 'map',

    waitOn: function() {
        return [
            Meteor.subscribe('startupsAll')
        ];
    },

    data: function() {
        return Startups.find();
    },

    action: function() {

        Session.set('loginDisabled', true);
        Session.set('hideMapFilters', true);

        this.render();

        this.render('accountsLoginform', {
            to: 'mapLayout.interface'
        });
    },

    onStop: function() {
        if (modal) {
            modal.modal('hide');
        }
        Session.set('loginDisabled', false);
    },

    loginBusy: (new ReactiveVar(false)),

    loginError: (new ReactiveVar(false))

});

Template.accountsLoginform.rendered = function() {
    var template = this;

    this.autorun(function() {
        if (!Session.get('polymerReady')) {
            return;
        }

        modal = template.$('.modal');

        modal.modal({
            'transition': 'vertical flip',
            'closable': false,
            onApprove: function() {
                return false;
            },
            onDeny: function() {
                Router.go(nextRoute);
            }
        }).modal('show');

        $(template.firstNode).form({
            username: {
                identifier: 'username',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a valid username'
                }]
            },
            password: {
                identifier: 'password',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter your password'
                }]

            }
        }, {
            'onSuccess': function(e) {
                e.preventDefault();

                Meteor.log.debug('', e);
                setBusy(true);

                var username = modal.find('[name="username"]').val(),
                    password = modal.find('[name="password"]').val();
                Meteor.loginWithPassword(username, password, function(err) {
                    setBusy(false);
                    if (err) {
                        Meteor.log.error('unable to log in');
                        setError(true);
                        return;
                    }
                    Router.go(nextRoute);
                });
            },

            onValid: function(e) {
                Meteor.log.debug('validated field', e);
                setError(false);
            }
        });
    });
};

var setBusy = function(busy) {
    Router.current().loginBusy.set(busy);
};

var setError = function(error) {
    Router.current().loginError.set(error);
}

Template.accountsLoginform.helpers({
    loginBusy: function() {
        return Iron.controller().loginBusy.get();
    },
    loginError: function() {
        return Iron.controller().loginError.get();
    }
});
