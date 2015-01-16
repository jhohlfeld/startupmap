(function() {
    var map, map_canvas;

    window.MapController = RouteController.extend({
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
        },
        // action: function() {
        //     this.render('map');

        //     console.log(this.data());
        // }
    });

    Template.map.rendered = function() {
        var template = this;
        this.autorun(function() {

            if (!Session.get('polymerReady') || !Session.get('mapboxReady')) {
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
                // var feature = {
                //     "type": "Feature",
                //     "geometry": startup.geolocation,
                //     "properties": {
                //         "name": startup.name
                //     }
                // };
                var icon = L.mapbox.marker.icon({
                        'marker-size': 'large',
                        'marker-symbol': UI.labelIcon('type', startup.type),
                        'marker-color': UI.labelColorHash('type', startup.type)
                    }),
                    marker = L.marker(startup.geolocation.coordinates.reverse(), {
                        icon: icon
                    });
                var popup = L.popup({
                    autoPanPaddingTopLeft: L.point(280, 14)
                }).setContent(Blaze.toHTMLWithData(Template.mapinfo, startup));
                marker.bindPopup(popup).addTo(map);
            });
        });
    };

    var filterProp = function(data, prop) {
        var items = _.map(_.groupBy(data.fetch(), prop), function(startups, key) {
            return {
                name: key,
                count: startups.length,
                startups: startups
            };
        });
        return items;
    }

    Template.mapfilters.helpers({
        industries: function() {
            return filterProp(Template.parentData(1), 'industry');
        },
        type: function() {
            return filterProp(Template.parentData(1), 'type');
        }
    });

})();
