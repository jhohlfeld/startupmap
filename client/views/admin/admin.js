var addDialog, addDialogView, removeDialogView;

var addDialogModal = function(element, options) {
    var options = options || {};
    element.modal.setData = $.proxy(options.setData || function(data) {
        var inputs = $('input,textarea', this);

        inputs.each(function(i, el) {
            var el = $(el);
            var val = data[el.attr('name')];
            el.val(val);
        });

        return this.modal('setting', {

            //
            // implement onApprove - SAVE
            //
            onApprove: options.onApprove || function() {
                var doc = data || {};
                inputs.each(function(i, el) {
                    var el = $(el);
                    doc[el.attr('name')] = el.val();
                });
                Meteor.call('saveStartup', doc);
                Router.go('admin');
            },

            onHidden: function() {
                Router.go('admin');
            }
        });
    }, element);

    return element.modal({
        context: 'body'
    }).modal('setting', {
        onHidden: options.onHidden || function() {
            Router.go('admin');
        }
    });
};

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
    }

});

AdminEditController = AdminController.extend({

    template: 'admin',

    waitOn: function() {
        var subscriptions = [
            Meteor.subscribe('startupsAll')
        ];
        if (this.params._id) {
            subscriptions.push(Meteor.subscribe('startup', this.params._id));
        }
        return subscriptions;
    },

    action: function() {
        this.render('admin');

        this.render('editstartup', {
            to: 'adminLayout.modal',
            data: function() {
                if (this.params._id) {
                    return Startups.findOne({
                        _id: this.params._id
                    });
                } else {
                    return {};
                }
            }
        });
    },

    onAfterAction: function() {
        if (addDialog && !addDialog.modal('is active')) {
            addDialog.modal('show');
        }
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
        if (!addDialog) {
            addDialog = addDialogModal(template.$('.modal'));
            addDialog.modal('show');
        }

        var data = Template.currentData();
        addDialog.modal.setData(data);

        var element = addDialog.find('input[name=location]'),
            geocoder = new Geocoder();
        Meteor.typeahead(element, geocoder.ttAdapter);
        element.on('typeahead:selected', function(event, suggestion, dataset) {
            data.geolocation = suggestion.location;
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

Template.startup.events({
    'click .item': function(e) {
        var $el = $(e.target);
        if ($el.hasClass('remove-startup')) {
            e.preventDefault();
            removeDialogView = Blaze.renderWithData(Template.removeconfirm, this, $('body')[0]);
            return;
        }
        Router.go('admin.edit', {
            _id: $el.closest('.item').data('id')
        });
    }
});
