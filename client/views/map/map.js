(function() {
    var map, map_canvas, mapMarkers = [];

    var filterIndexMap = ['type', 'industry'];

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
        }
    });

    Template.map.rendered = function() {
        var template = this;
        this.autorun(function(c) {

            if (!Session.get('polymerReady') || !Session.get('mapboxReady')) {
                return;
            }

            if (!map_canvas) {

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

            } else {
                $('#map').replaceWith(map_canvas);
            }

            // re-apply data

            console.log('(re)applying map data');

            $('.ui.dropdown').dropdown();

            Deps.nonreactive(function() {
                var accordion = $('.ui.accordion').accordion('open', Session.get('mapfiltersVisible'));
                accordion.accordion('setting', {
                    onOpen: function() {
                        var index = Math.floor($(this).index() / 2);
                        Session.set('mapfiltersVisible', index);
                    }
                });
            });

            $(map.getPanes().markerPane).empty();
            mapMarkers = [];

            template.data.forEach(function(startup) {
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
                marker.data = startup;

                mapMarkers.push(marker);
            });
        });

        this.autorun(function(c) {
            var category = filterIndexMap[Session.get('mapfiltersVisible')];

            console.log('mapfilter changed');

            mapMarkers.forEach(function(marker) {
                var icon = L.mapbox.marker.icon({
                    'marker-size': 'large',
                    'marker-symbol': UI.labelIcon(category, marker.data[category]),
                    'marker-color': UI.labelColorHash(category, marker.data[category])
                });
                marker.setIcon(icon);
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

    Template.mapfilters.helpers(
        _.object(filterIndexMap, _.map(filterIndexMap, function(f) {
            return function() {
                return filterProp(Template.parentData(1), f);
            };
        }))
    );

})();
