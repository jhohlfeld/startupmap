Template.admin.rendered = function() {
    $('.ui.modal').modal();
};

Template.admin.events({
	'click .button#add-startup-button': function(event, template) {
		$('#add-startup-modal').modal('show');
	}
});
