Session.set('showLogin', false);

var form,
    nextRoute = 'admin',
    loginBusy = new ReactiveVar(false),
    loginError = new ReactiveVar(false);

Template.accountsLoginform.rendered = function() {
    var template = this;

    this.autorun(function() {
        if (!Session.get('polymerReady') || !Session.get('showLogin')) {
            return;
        }

        form = $(template.find('form'));

        form.modal({
            'transition': 'vertical flip',
            onApprove: function() {
                return false;
            },
            onDeny: function() {
                form.form('clear');
                Session.set('showLogin', false);
            },
            onHidden: function() {
                Session.set('showLogin', false);
            }
        }).modal('show');

        form.form({
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

                Meteor.log.debug('recieving login request', e);
                loginBusy.set(true);

                var username = form.find('[name="username"]').val(),
                    password = form.find('[name="password"]').val();
                Meteor.loginWithPassword(username, password, function(err) {
                    loginBusy.set(false);
                    if (err) {
                        Meteor.log.error('unable to log in');
                        loginError.set(true);
                        return;
                    }
                    form.modal('hide');
                    Router.go(nextRoute);
                });
            },

            onValid: function(e) {
                Meteor.log.debug('validated field', e);
                loginError.set(false);
            }
        });
    });
};

Template.accountsLoginform.helpers({
    loginBusy: function() {
        return loginBusy.get();
    },
    loginError: function() {
        return loginError.get();
    }
});
