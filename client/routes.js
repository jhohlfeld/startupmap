Router.configure({
    layoutTemplate: 'mapLayout',
    loadingTemplate: 'loading'
});

Router.route('map', {
    path: '/'
});

Router.route('/admin', {
    name: 'admin',
});

Router.route('/admin/edit-startup', {
	name: 'admin.add',
	controller: 'AdminController'
});

Router.route('/admin/edit-startup/:_id', {
	name: 'admin.edit',
	controller: 'AdminController'
});

Meteor.startup(function() {

    Meteor.polymerReady = new ReactiveVar(false);

    window.addEventListener('polymer-ready', function(e) {
        console.log('polymer ready...')
        Meteor.polymerReady.set(true);
    });
});
