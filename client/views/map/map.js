(function() {
    var map, map_canvas, markers, mapMarkers = [];

    var filterIndexMap = ['type', 'industry'];

    Session.set('category', {});

    MapController = RouteController.extend({
        layoutTemplate: 'mapLayout',

        onStop: function() {
            map_canvas.detach();
        },
        waitOn: function() {
            return Meteor.subscribe('startups');
        },
        data: function() {
            return Startups.find();
        },
        action: function() {
            this.render('map', {
                to: 'map'
            });

            this.render('mapfilters', {
                to: 'mapfilters',
                data: function() {
                    return Startups.find();
                }
            });
        }
    });

    MapFilteredController = MapController.extend({
        waitOn: function() {
            return [
                Meteor.subscribe('startupsFiltered', this.params.category, this.params.value),
                Meteor.subscribe('startups')
            ];
        },

        data: function() {
            var q = {};
            q[this.params.category] = {
                '$regex': '^' + this.params.value + '$',
                '$options': 'i'
            };
            return Startups.find(q);
        },

        action: function() {
            this.render('map', {
                to:'map'
            });
            this.render('mapfilters', {
                to: 'mapfilters',
                data: function() {
                    return Startups.find();
                }
            });
        }
    });

    Template.mapfilters.events({
        'click .item': function(e) {
            Router.go('map.filter', {
                category: this.category,
                value: this.name.toLowerCase()
            });
            e.preventDefault();
        }
    });

    Template.map.rendered = function() {
        var template = this;

        console.log('rendering map.');

        this.autorun(function(c) {

            if (!Session.get('polymerReady') || !Session.get('mapboxReady')) {
                return;
            }

            var data = Template.currentData();

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

                markers = new L.MarkerClusterGroup();
                map.addLayer(markers);

            } else {
                $('#map').replaceWith(map_canvas);
            }

            // re-apply data

            console.log('(re)applying map data');

            $('.ui.dropdown').dropdown();

            Tracker.nonreactive(function() {
                var accordion = $('.ui.accordion').accordion('open', Session.get('mapfiltersVisible'));
                accordion.accordion('setting', {
                    onOpen: function() {
                        var index = Math.floor($(this).index() / 2);
                        Session.set('mapfiltersVisible', index);
                    }
                });
            });

            markers.clearLayers();
            mapMarkers = [];

            data.forEach(function(startup) {
                var icon = L.mapbox.marker.icon({
                        'marker-size': 'large',
                        'marker-symbol': UI.labelIcon('type', startup.type),
                        'marker-color': UI.labelColorHash('type', startup.type)
                    }),
                    marker = L.marker(startup.geolocation.coordinates.reverse(), {
                        icon: icon,
                        title: startup.type + ': ' + startup.name
                    });
                var popup = L.popup({
                    autoPanPaddingTopLeft: L.point(280, 14)
                }).setContent(Blaze.toHTMLWithData(Template.mapinfo, startup));

                marker.bindPopup(popup);
                marker.data = startup;

                mapMarkers.push(marker);
            });

            markers.addLayers(mapMarkers);
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

    Template.mapfilters.helpers(_.extend({},

        // adding helper related to map filter 
        // (like startup 'type', 'industry' etc.)
        _.object(filterIndexMap, _.map(filterIndexMap, function(f) {
            return function() {
                var items = _.map(_.groupBy(Template.currentData().fetch(), f), function(startups, key) {
                    return {
                        category: f,
                        name: key,
                        count: startups.length,
                        startups: startups
                    };
                });
                return items;
            };
        }))));

})();
