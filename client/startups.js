Router.configure({
    layoutTemplate: 'ApplicationLayout',
    loadingTemplate: 'loading'
});

Router.route('home', {
    path: '/',
    template: 'map'
        // action: function() {
        //     if (this.ready()) {
        //         this.render('map');
        //     }
        // }
});

Router.route('/admin');

/** mapbox configuration **/

// Basic

Meteor.startup(function() {
    window.addEventListener('polymer-ready', function(e) {
    	// console.log('initializing mapbox');
     //    Mapbox.load();
    });
});
