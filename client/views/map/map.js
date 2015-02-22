var map,
    map_canvas,
    markers = {},
    markerClusterer;

Session.set('map.infoPopupDisplay', null);
Session.set('map.infoWindowDisplay', null);

// map controller

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

// info popup

var infoPopup;

Tracker.autorun(function() {
    var startup = Session.get('map.infoPopupDisplay');
    if (infoPopup) {
        if (startup !== null) {
            var html = Blaze.toHTMLWithData(Template.infoPopup, startup);
            infoPopup.setContent(html);
            var marker = markers[startup._id];
            infoPopup.open(map, marker);
        } else {
            infoPopup.close();
        }
    }
});

// info window

Tracker.autorun(function() {
    var startup = Session.get('map.infoWindowDisplay');
    if (!map) {
        return;
    }

    var position = google.maps.ControlPosition.TOP_LEFT;
    if (map.controls[position].getAt(0)) {
        map.controls[position].removeAt(0)
    }

    if (startup) {

        // create new info window

        var html = $(Blaze.toHTMLWithData(Template.infoWindow, startup)),
            control = $(html)[0];

        // reduce header tags in description to below h3

        html.find('.description').find('h1,h2,h3,h4,h5').each(function(e) {
            var headerValue = (parseInt(this.nodeName.substr(1)) + 2);
            if (headerValue > 5) {
                headerValue = 5;
            }
            var nodeName = 'h' + headerValue;
            var oldNode = $(this),
                newNode = $('<' + nodeName + '>', {
                    text: oldNode.text()
                });
            oldNode.children().appendTo(newNode);
            oldNode.replaceWith(newNode);
        });

        map.controls[position].setAt(0, control);

    } else {
        Router.go('map');
    }
});

// map template

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

            // init clustering

            var mcOptions = {
                gridSize: 50,
                maxZoom: 12
            };
            markerClusterer = new MarkerClusterer(map, [], mcOptions);

            // init info popup

            infoPopup = new google.maps.InfoWindow({
                maxWidth: 400
            });

            google.maps.event.addListener(map, 'click', function(event) {
                Session.set('map.infoWindowDisplay', null);
            });

        } else {
            $('#map').replaceWith(map_canvas);
        }

        // re-apply data

        Meteor.log.debug('(re)applying map data');

        markerClusterer.clearMarkers();

        data.forEach(function(startup) {

            // only create the same marker once
            var marker = markers[startup._id];
            if (!marker) {
                var c = startup.geolocation.coordinates;
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(c[0], c[1])
                });

                markers[startup._id] = marker;
                google.maps.event.addListener(marker, 'mouseover', function() {
                    Session.set('map.infoPopupDisplay', startup);
                });

                google.maps.event.addListener(marker, 'mouseout', function() {
                    Session.set('map.infoPopupDisplay', null);
                });
            }

            markerClusterer.addMarker(marker);

            // update map position if info slug selected

            if (Router.current().route.getName() === 'map.info') {
                var slug = Router.current().params.slug;
                if (startup.slug === slug) {
                    var toZoom = 13,
                        pos = marker.getPosition(),
                        east = map_canvas.width() / 4 * toZoom * 0.000013,
                        bounds = map.getBounds();
                    map.setZoom(toZoom);
                    pos = new google.maps.LatLng(pos.lat(), pos.lng() - east);
                    if (!bounds || !bounds.contains(pos)) {
                        map.panTo(pos);
                    }
                    Session.set('map.infoPopupDisplay', startup);
                    Session.set('map.infoWindowDisplay', startup);
                }
            }

            // show info window when marker is clicked

            google.maps.event.addListener(marker, 'click', function() {
                Router.go('map.info', {
                    slug: startup.slug
                });
            });

        });


    });
}
