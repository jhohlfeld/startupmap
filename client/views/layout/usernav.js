Template.userAdminButton.helpers({
    isAdmin: function() {
        return Router.current().route.getName().match(/^admin/);
    }
});

Template.userNav.helpers({
	loginDisabled: function() {
		return Session.get('loginDisabled') ? 'disabled' : '';
	}
});

Template.userNav.events({
	'click button.logout':function(){
		Meteor.logout(function(){
			Router.go('map');
		});
	}
});