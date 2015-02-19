var map,
    map_canvas,
    markers = {},
    markerClusterer;

MapController = RouteController.extend({

    layoutTemplate: 'mapLayout',
    template: 'map',

    waitOn: function() {
        return Meteor.subscribe('startupsAll');
    },

    data: function() {

        var activeItems = Session.get('map.filterActiveItems') || {},
            industries = [];

        _.each(activeItems, function(v) {
            if (v.selected) {
                industries.push(v.title);
            }
        });

        var query = {
            'geolocation.coordinates': {
                '$exists': true
            },
            'industry': {
                '$in': industries
            }
        };

        return Startups.find(query);
    },

    action: function() {

        Session.set('hideMapFilters', false);

        this.render('map');
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
    var infowindowOpen;

    this.autorun(function() {
        var data = Template.currentData();

        if (!Session.get('polymerReady')) {
            return;
        }

        if (!map_canvas) {

            // initialize map _once_

            map_canvas = $('#map');

            Meteor.log.debug('initializing map');

            // Create an array of styles.
            var mapColor = '#5bbd72',
                styles = [{
                    "featureType": "water",
                    "stylers": [{
                        "color": mapColor
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{
                        "visibility": "simplified"
                    }, {
                        "color": mapColor
                    }, {
                        "gamma": 0.67
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.province",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "landscape",
                    "stylers": [{
                        "color": mapColor
                    }, {
                        "visibility": "on"
                    }, {
                        "gamma": 10
                    }, {
                        "lightness": 50
                    }]
                }];

            // Create a new StyledMapType object, passing it the array of styles,
            // as well as the name to be displayed on the map type control.
            var styledMap = new google.maps.StyledMapType(styles, {
                name: "Styled Map"
            });

            var mapOptions = {
                center: new google.maps.LatLng(51.1642292, 10.4541194),
                zoom: 6,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    style: google.maps.ZoomControlStyle.SMALL
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                }

            };

            map = new google.maps.Map(map_canvas[0], mapOptions);

            // Associate the styled map with the MapTypeId 
            // and set it to display.

            map.mapTypes.set('map_style', styledMap);
            map.setMapTypeId('map_style');

            google.maps.event.addListener(map, "click", function(event) {
                if (infowindowOpen) {
                    infowindowOpen.close();
                    infowindowOpen = null;
                }
            });

            // init clustering

            var mcOptions = {
                gridSize: 50,
                maxZoom: 15
            };
            markerClusterer = new MarkerClusterer(map, [], mcOptions);

        } else {
            $('#map').replaceWith(map_canvas);
        }

        // re-apply data

        Meteor.log.debug('(re)applying map data');

        markerClusterer.clearMarkers();

        data.forEach(function(startup) {

            // only create the same marker once
            if (markers[startup._id]) {
                markerClusterer.addMarker(markers[startup._id]);
                return;
            }

            var c = startup.geolocation.coordinates,
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(c[0], c[1]),
                    title: startup.type + ': ' + startup.name
                });

            markers[startup._id] = marker;

            var infowindow = new google.maps.InfoWindow({
                maxWidth: 400
            });

            google.maps.event.addListener(marker, 'click', function() {
                if (infowindowOpen && infowindowOpen !== infowindow) {
                    infowindowOpen.close();
                }
                var html = $(Blaze.toHTMLWithData(Template.mapinfo, startup));
                html.find('.description').find('h1,h2,h3').each(function(e) {
                    var nodeName = 'h' + (parseInt(this.nodeName.substr(1)) + 2);
                    var oldNode = $(this),
                        newNode = $('<' + nodeName + '>', {
                            text: oldNode.text()
                        });
                    oldNode.children().appendTo(newNode);
                    oldNode.replaceWith(newNode);
                });
                infowindow.setContent(html[0]);
                infowindow.open(map, marker);
                infowindowOpen = infowindow;
            });

            markerClusterer.addMarker(marker);
        });

    });
}
