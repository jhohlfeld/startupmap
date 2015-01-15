var map, map_canvas;

MapController = RouteController.extend({
    onStop: function() {
        map_canvas.detach();
    },
    waitOn: function() {
        var subscriptions = [function() {
            return Meteor.subscribe('startups')
        }];
        return subscriptions;
    },
    data: function() {
        return Startups.find();
    }
});

Template.map.rendered = function() {
    var template = this;
    this.autorun(function() {

        if (!Meteor.polymerReady.get()) {
            return;
        }
        if (!Mapbox.loaded()) {

            // console.log('loading mapbox');
            // Mapbox.load();
            return;

        }
        if (map_canvas) {
            $('#map').replaceWith(map_canvas);
            return;
        }

        // initialize map _once_

        map_canvas = $('#map');

        console.log('initializing mapbox');

        map = L.mapbox.map('map', Session.get('mapId'), {
            zoomControl: false
        });

        var zoom = L.control.zoom({
            position: 'topright'
        });

        map.addControl(zoom);

        $('.ui.dropdown').dropdown();
        $('.ui.accordion').accordion();

        template.data.forEach(function(startup) {
            var feature = {
                "type": "Feature",
                "geometry": startup.geolocation,
                "properties": {
                    "name": startup.name
                }
            };
            var marker = L.geoJson(feature).addTo(map);
            var popup = L.popup({
                autoPanPaddingTopLeft: L.point(280, 14)
            }).setContent(Blaze.toHTMLWithData(Template.mapinfo, startup));
            marker.bindPopup(popup);
        });
    });
};
