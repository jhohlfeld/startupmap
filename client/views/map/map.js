var map, map_canvas;

MapController = RouteController.extend({
    onStop: function() {
        map_canvas.detach();
    }
});

Template.map.rendered = function() {
    this.autorun(function() {

        if (!Meteor.polymerReady.get()) {
            return;
        }
        if (!Mapbox.loaded()) {

            console.log('loading mapbox');
            Mapbox.load();
            return;

        }
        if (map_canvas) {
            $('#map').replaceWith(map_canvas);
            return;
        }

        // initialize map _once_
        
        map_canvas = $('#map');

        console.log('initializing mapbox');

        L.mapbox.accessToken = 'pk.eyJ1IjoiamhvaGxmZWxkIiwiYSI6IjRVTFJXY0EifQ.K8QEmAJhBKxRt3eJ7fA8eA';
        map = L.mapbox.map('map', 'jhohlfeld.klaa8f80', {
            zoomControl: false
        });

        var zoom = L.control.zoom({
            position: 'topright'
        });

        map.addControl(zoom);

        $('.ui.dropdown').dropdown();
        $('.ui.accordion').accordion();

    });
};
