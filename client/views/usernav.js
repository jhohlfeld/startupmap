Template.UserNav.helpers({
    isAdmin: function() {
        return Router.current().route.getName().match(/^admin/);
    }
});
