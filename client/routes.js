Router.configure({
    layoutTemplate: 'ApplicationLayout',
    loadingTemplate: 'loading'
});

Router.route('map', {
    path: '/'
});

Router.route('admin');

Router.route('admin/add-startup', {
	action: function(){
		this.render('admin', {
			data: {showAddDialog: true}
		});
	}
});

Meteor.startup(function() {

	Meteor.polymerReady = new ReactiveVar(false);
    
    window.addEventListener('polymer-ready', function(e) {
    	console.log('polymer ready...')
    	Meteor.polymerReady.set(true);
    });
});

