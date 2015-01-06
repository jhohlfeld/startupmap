Router.configure({
    layoutTemplate: 'ApplicationLayout',
    loadingTemplate: 'loading'
});

Router.route('home', {
    path: '/',
    template: 'map'
});

Router.route('/admin');

Meteor.startup(function() {

	Meteor.polymerReady = new ReactiveVar(false);
    
    window.addEventListener('polymer-ready', function(e) {
    	console.log('polymer ready...')
    	Meteor.polymerReady.set(true);
    });
});
