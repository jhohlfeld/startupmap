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

        Session.set('hideMapFilters', false);

        this.render('map');

        this.render('mapFilter', {
            to: 'mapLayout.interface',
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
    var infowindowOpen;

    this.autorun(function() {
        var data = Template.currentData()

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

            //Associate the styled map with the MapTypeId and set it to display.
            map.mapTypes.set('map_style', styledMap);
            map.setMapTypeId('map_style');

            google.maps.event.addListener(map, "click", function(event) {
                infowindowOpen.close();
            });

            // controls

            // var filterMap = Blaze.toHTMLWithData();
            // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterMap);

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

        data.forEach(function(startup) {
            if (!startup.geolocation || !startup.geolocation.coordinates) {
                return;
            }

            var c = startup.geolocation.coordinates,
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(c[0], c[1]),
                    map: map,
                    title: startup.type + ': ' + startup.name
                });

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

Template.mapFilter.helpers({
    hideMapFilters: function() {
        return Session.get('hideMapFilters');
    }
});
