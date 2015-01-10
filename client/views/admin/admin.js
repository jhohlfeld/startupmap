var addDialog;

var addDialogModal = function(element, template, data) {
    element.modal.setData = $.proxy(function(data) {

        if (!data) {
            return;
        }

        var inputs = $('input,textarea', this);

        inputs.each(function(i, el) {
            var el = $(el);
            var val = data[el.attr('name')];
            el.val(val);
        });

        this.modal('setting', {
            onApprove: function() {
                var doc = {};
                if (data && data._id) {
                    doc._id = data._id;
                }
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

        return this;
    }, element);

    return element.modal();
};

AdminController = RouteController.extend({
    template: 'admin',
    layoutTemplate: 'adminLayout',
    loadingTemplate: 'loading',

    waitOn: function() {
        var subscriptions = [function() {
            return Meteor.subscribe('startups')
        }];
        return subscriptions;
    },

    action: function() {
        console.log('action..');

        this.render('admin');
        this.render('addstartup', {
            to: 'addstartup',
            data: function() {
                if (this.route.path() !== '/admin') {
                    if (this.params._id) {
                        return Startups.findOne({
                            _id: this.params._id
                        });

                    } else {
                        return {};
                    }
                } else {

                    return null;
                }
            }
        });
    }

});

Template.admin.rendered = function() {
    console.log('rendered admin view..');
};

Template.addstartup.rendered = function() {
    var template = this;
    this.autorun(function() {
        if (!Meteor.polymerReady.get()) {
            return;
        }
        if (!addDialog) {
            addDialog = addDialogModal(template.$('.modal'), template);
        }

        var data = Template.currentData(template.view);
        addDialog.modal.setData(data);
        if (data) {
            addDialog.modal('show');
        } else {
            addDialog.modal('hide');
        }
    });
};

Template.admin.helpers({
    startups: function() {
        return Startups.find({});
    }
});
