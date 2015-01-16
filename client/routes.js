Router.configure({
    layoutTemplate: 'mapLayout',
    loadingTemplate: 'loading'
});

Router.route('map', {
    path: '/',
    controller: 'MapController'
});

Router.route('map.filter', {
    path: '/:category/:value',
    controller: 'MapController'
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

Router.route('/admin/remove-startup/:_id', {
    name: 'admin.remove',
    controller: 'AdminController'
});
