var map, map_canvas, markers, mapMarkers = [],
    mapId = Meteor.settings.public.mapbox.mapId;

MapController = RouteController.extend({

    layoutTemplate: 'mapLayout',
    template: 'map',

    waitOn: function() {
        return [
            Meteor.subscribe('startupsAll')
        ];
    },

    data: function() {
        return Startups.find();
    },

    action: function() {
        this.render('map');

        this.render('mapFilter', {
            to: 'filter',
            data: function() {
                var data = Startups.find({}, {
                    fields: {
                        'type': 1,
                        'industry': 1
                    }
                }).fetch();

                var getCategoryItem = function(category) {
                    var d = _.groupBy(data, category);
                    return _.map(d, function(v, k) {
                        return {
                            title: k,
                            name: k.toLowerCase(),
                            count: v.length
                        };
                    });
                };
                return {
                    type: getCategoryItem('type'),
                    industry: getCategoryItem('industry')
                };
            }
        });
    }
});

MapFilteredController = MapController.extend({
    waintOn: function() {
        return Meteor.subscribe('startupsFiltered', this.params.category, this.params.value);
    },

    data: function() {
        var q = {};
        q[this.params.category] = {
            '$regex': '^' + this.params.value + '$',
            '$options': 'i'
        };
        return Startups.find(q);
    }

});

Template.map.rendered = function() {
    var template = this;

    this.autorun(function() {
        var data = Template.currentData()

        if (!Session.get('polymerReady') || !Session.get('mapReady')) {
            return;
        }

        if (!map_canvas) {

            // initialize map _once_

            map_canvas = $('#map');

            Meteor.log.debug('initializing mapbox');

            map = L.mapbox.map('map', mapId, {
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

        Meteor.log.debug('(re)applying map data');

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
            if (!startup.geolocation || !startup.geolocation.coordinates) {
                return;
            }

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
        var filterIndexMap = Session.get('config').filterIndexMap,
            category = filterIndexMap[Session.get('mapfiltersVisible')];

        Meteor.log.debug('mapfilter changed');

        mapMarkers.forEach(function(marker) {
            var icon = L.mapbox.marker.icon({
                'marker-size': 'large',
                'marker-symbol': UI.labelIcon(category, marker.data[category]),
                'marker-color': UI.labelColorHash(category, marker.data[category])
            });
            marker.setIcon(icon);
        });
    });

}

Template.mapFilter.rendered = function() {
    var template = this;
    this.autorun(function() {

        if (!Session.get('polymerReady')) {
            return;
        }

        template.$('.accordion a.item').each(function() {
            var $el = $(this);
            var params = {
                category: $el.data('category'),
                value: $el.data('value')
            };
            $el.on('click', function(e) {
                Router.go('map.filter', params);
                e.preventDefault();
            });
        });

        var filtersOpen = Session.get('mapfiltersVisible') || 0,
            accordion = $('.ui.accordion').accordion('open', filtersOpen);
        accordion.accordion('setting', {
            onOpen: function() {
                var index = Math.floor($(this).index() / 2);
                Session.set('mapfiltersVisible', index);
            }
        });
    });
};
