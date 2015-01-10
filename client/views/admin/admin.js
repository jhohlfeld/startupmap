var addDialog;

Template.admin.rendered = function() {

    var template = this;
    this.autorun(function() {
        if (!Meteor.polymerReady.get()) {
            return;
        }

        if(!addDialog) {
        	return;
        }
        var showAddDialog = template.data && template.data.showAddDialog === true;
        if (showAddDialog) {
            addDialog.modal('show');
        }

    });

};

Template.addstartup.rendered = function() {
    addDialog = this.$('.modal').modal('setting', {
        onApprove: function() {
            var inputs = $('input,textarea', this);
            var doc = {
                name: inputs.filter('[name="name"]').val(),
                website: inputs.filter('[name="website"]').val(),
                type: inputs.filter('[name="type"]').val(),
                industry: inputs.filter('[name="industry"]').val(),
                description: inputs.filter('[name="description"]').val(),
                founded: inputs.filter('[name="founded"]').val(),
                headcount: inputs.filter('[name="headcount"]').val()
            }
            Meteor.call('addStartup', doc);
        },
        onHidden: function() {
        	Router.go('admin');
        }
    });

};

Template.admin.helpers({
    startups: function() {
        return Startups.find({});
    }
});
