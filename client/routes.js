Router.route('/', {
    name: 'map'
});

Router.route('/filter/:category/:value', {
    name: 'map.filter',
    controller: 'MapController'
});

Router.route('/admin', {
    name: 'admin',
});

Router.route('/admin/edit-startup', {
    name: 'admin.add',
    controller: 'AdminEditController'
});

Router.route('/admin/edit-startup/:_id', {
    name: 'admin.edit',
    controller: 'AdminEditController'
});
