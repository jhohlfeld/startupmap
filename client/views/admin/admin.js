var addDialog;

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
            onApprove: options.onApprove || function() {
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
            }
        });
    }, element);

    return element.modal('setting', {
        onHidden: options.onHidden || function() {
            Router.go('admin');
        }
    });
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
        this.render('admin');
        var geocoder = new Geocoder();
        this.render('editstartup', {
            to: 'editstartup',
            data: function() {
                return {
                    startup: this.params._id ? Startups.findOne({
                        _id: this.params._id
                    }) : {},
                    showDialog: (this.route.path() !== '/admin'),
                    geocoder: geocoder
                };
            }
        });
    }

});

Template.admin.rendered = function() {
    console.log('rendered admin view..');
};

Template.editstartup.rendered = function() {
    var template = this;
    this.autorun(function() {
        if (!Meteor.polymerReady.get()) {
            return;
        }
        if (!addDialog) {
            addDialog = addDialogModal(template.$('.modal'));
        }

        var data = Template.currentData(template.view);
        if (data && data.showDialog) {
            addDialog.modal.setData(data.startup);
            addDialog.modal('show');
	        Meteor.typeahead(addDialog.find('input[name=location]'), template.data.geocoder.source);
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
