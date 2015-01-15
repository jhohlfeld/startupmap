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

            //
            // implement onApprove - SAVE
            //
            onApprove: options.onApprove || function() {
                var doc = data || {};
                // if (data && data._id) {
                //     doc._id = data._id;
                // }
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

        if (this.route.getName() == 'admin.remove') {
            this.render('removeconfirm', {
                to: 'modal',
                data: Startups.findOne({
                    _id: this.params._id
                })
            });
            return;
        }
        var geocoder = new Geocoder();
        this.render('editstartup', {
            to: 'modal',
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

Template.removeconfirm.rendered = function() {
    var template = this;
    this.autorun(function() {
        if (!Meteor.polymerReady.get()) {
            return;
        }
        var modal = template.$('.modal').modal('show');
        modal.modal('setting', {
            onApprove:function(){
                Meteor.call('removeStartup', template.data._id);
                Router.go('admin');
            },
            onHidden:function(){
                Router.go('admin');
            }
        });
    });
};

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
            var element = addDialog.find('input[name=location]');
            Meteor.typeahead(element, template.data.geocoder.ttAdapter);
            element.on('typeahead:selected', function(event, suggestion, dataset) {
                data.startup.geolocation = suggestion.location;
                // console.log(event, suggestion, dataset)
            });
        } else {
            addDialog.modal('hide');
        }

    });
};

Template.startup.events({
    'click .item': function(e) {
        var $el = $(e.target);
        if ($el.hasClass('button')) {
            return;
        }
        Router.go('admin.edit', {
            _id: $el.closest('.item').data('id')
        });
    }
});

Template.admin.helpers({
    startups: function() {
        return Startups.find({});
    }
});
